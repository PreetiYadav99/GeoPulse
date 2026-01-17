import os
import json
import logging
from pathlib import Path

LOG = logging.getLogger(__name__)


class ModelWrapper:
    def __init__(self, keras_model=None, pytorch_model=None, pickled_models=None, labels=None):
        # keras_model: loaded Keras model instance
        # pytorch_model: loaded torch model instance
        # pickled_models: dict name -> model (sklearn/joblib)
        self.keras = keras_model
        self.pytorch = pytorch_model
        self.pickled = pickled_models or {}
        self.labels = labels or []

    def _map_label(self, idx):
        try:
            return self.labels[idx]
        except Exception:
            return f'class_{idx}'
    def predict_manual_input(self, data):
        """
        data: dict with input fields:
        temperature, humidity, moisture, soilType, cropType, nitrogen, potassium, phosphorous, fertilizerName
        Returns: dict with keys: crop, fertilizer, states, farming_suggestions, disease_prevention, chart_data
        """
        # Example static logic for demo/testing.
        crop = "Wheat"  # Use your actual model/predict logic here
        fertilizer = data.get('fertilizerName', 'NPK 10:10:10')
        states = ["Punjab", "Uttar Pradesh"]
        farming_suggestions = [
            f"Check nitrogen: {data.get('nitrogen')}",
            f"Moisture: {data.get('moisture')}",
            "Use drip irrigation for best yield."
        ]
        disease_prevention = [
            "Apply fungicide if humidity > 70%.",
            "Monitor soil moisture regularly."
        ]
        chart_data = {"weeks": [20, 30, 25, 18]} # Example graph placeholder

        return {
            "crop": crop,
            "fertilizer": fertilizer,
            "states": states,
            "farming_suggestions": farming_suggestions,
            "disease_prevention": disease_prevention,
            "chart_data": chart_data
        } 

    def predict_from_image(self, image_path):
        """Run a prediction on a local image file.

        Returns a dict with keys: label, confidence, details
        """
        if not (self.keras or self.pytorch):
            raise RuntimeError("No image model loaded")

        # Lazy-import image libs
        try:
            from PIL import Image
            import numpy as np
        except Exception as e:
            LOG.exception('Pillow/numpy required for image preprocessing: %s', e)
            raise

        # Prepare image
        img = Image.open(image_path).convert('RGB')

        # Keras path
        if self.keras:
            try:
                # infer input size from model if possible
                input_shape = getattr(self.keras, 'input_shape', None)
                if input_shape and isinstance(input_shape, tuple):
                    # input_shape may be (None, H, W, C) or (H, W, C)
                    shape = tuple([s for s in input_shape if s is not None and s != 1])
                    if len(shape) == 3:
                        _, h, w = (None, shape[0], shape[1]) if input_shape[0] is None and len(shape) == 3 else (None, shape[0], shape[1])
                        target_size = (shape[0], shape[1])
                    else:
                        target_size = (224, 224)
                else:
                    target_size = (224, 224)

                img_resized = img.resize(target_size)
                arr = np.asarray(img_resized).astype('float32') / 255.0
                # add batch
                if arr.ndim == 3:
                    batch = np.expand_dims(arr, axis=0)
                else:
                    batch = arr

                preds = self.keras.predict(batch)
                # keras predict may return logits or probabilities
                try:
                    probs = np.asarray(preds[0])
                except Exception:
                    probs = np.asarray(preds)
                # softmax if needed
                if probs.ndim == 1 and probs.sum() > 0 and probs.max() > 1:
                    # attempt softmax
                    exps = np.exp(probs - np.max(probs))
                    probs = exps / exps.sum()

                top_idx = int(np.argmax(probs))
                confidence = float(probs[top_idx]) if probs.size > 0 else 0.0
                label = self._map_label(top_idx)
                details = {'probabilities': probs.tolist()} if hasattr(probs, 'tolist') else {'probabilities': list(probs)}
                return {'label': label, 'confidence': confidence, 'details': details}
            except Exception as e:
                LOG.exception('Keras prediction failed: %s', e)
                return {'label': None, 'confidence': 0.0, 'details': {'error': str(e)}}

        # PyTorch path (not expected here unless pytorch model loaded)
        if self.pytorch:
            try:
                import numpy as np
                import torch
                from torchvision import transforms
                # try to infer input size
                target_size = (224, 224)
                preprocess = transforms.Compose([
                    transforms.Resize(target_size),
                    transforms.ToTensor(),
                    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
                ])
                img_t = preprocess(img).unsqueeze(0)
                with torch.no_grad():
                    out = self.pytorch(img_t)
                    probs = torch.softmax(out, dim=1).cpu().numpy()[0]
                top_idx = int(probs.argmax())
                confidence = float(probs[top_idx])
                label = self._map_label(top_idx)
                return {'label': label, 'confidence': confidence, 'details': {'probabilities': probs.tolist()}}
            except Exception as e:
                LOG.exception('PyTorch prediction failed: %s', e)
                return {'label': None, 'confidence': 0.0, 'details': {'error': str(e)}}


def load_model(model_dir='ml_model'):
    """Discover and load models from model_dir.

    - Loads Keras .h5 model if present (cnn_model.h5 preferred)
    - Loads PyTorch .pt/.pth if present
    - Loads any pickled sklearn models (.pkl) into a dict
    - Loads labels from labels.json or classes.txt if present

    Returns a ModelWrapper or None.
    """
    model_dir = Path(model_dir)
    if not model_dir.exists():
        LOG.info('ml_model directory not found: %s', model_dir)
        return None

    keras_model = None
    pytorch_model = None
    pickled = {}
    labels = []

    # Load labels if present
    labels_json = model_dir / 'labels.json'
    classes_txt = model_dir / 'classes.txt'
    if labels_json.exists():
        try:
            labels = json.loads(labels_json.read_text())
            # if it's a dict mapping index->name, convert to list
            if isinstance(labels, dict):
                # ensure numeric ordering
                labels = [labels[str(i)] if str(i) in labels else labels.get(i) for i in range(len(labels))]
        except Exception:
            LOG.exception('Failed to read labels.json')
            labels = []
    elif classes_txt.exists():
        try:
            labels = [l.strip() for l in classes_txt.read_text().splitlines() if l.strip()]
        except Exception:
            LOG.exception('Failed to read classes.txt')
            labels = []

    # Keras .h5 (prefer cnn_model.h5 if present)
    try:
        h5_candidates = [p for p in model_dir.iterdir() if p.suffix == '.h5']
        preferred = model_dir / 'cnn_model.h5'
        if preferred.exists():
            h5_path = preferred
        elif h5_candidates:
            h5_path = h5_candidates[0]
        else:
            h5_path = None

        if h5_path:
            try:
                from tensorflow.keras.models import load_model as keras_load
                LOG.info('Loading Keras model from %s', h5_path)
                keras_model = keras_load(str(h5_path))
            except Exception:
                LOG.exception('Failed to load Keras .h5 model')
    except Exception:
        LOG.exception('Error while searching for Keras models')

    # TensorFlow SavedModel
    try:
        if (model_dir / 'saved_model.pb').exists():
            try:
                import tensorflow as tf
                LOG.info('Loading TensorFlow saved_model from %s', model_dir)
                keras_model = tf.saved_model.load(str(model_dir))
            except Exception:
                LOG.exception('Failed to load TensorFlow saved_model')
    except Exception:
        LOG.exception('SavedModel check failed')

    # PyTorch models
    try:
        pt_files = [p for p in model_dir.iterdir() if p.suffix in ('.pt', '.pth')]
        if pt_files:
            try:
                import torch
                pt_path = pt_files[0]
                LOG.info('Loading PyTorch model from %s', pt_path)
                pytorch_model = torch.load(str(pt_path), map_location='cpu')
                try:
                    pytorch_model.eval()
                except Exception:
                    pass
            except Exception:
                LOG.exception('Failed to load PyTorch model')
    except Exception:
        LOG.exception('PyTorch check failed')

    # Load pickled models (.pkl)
    try:
        for p in model_dir.iterdir():
            if p.suffix == '.pkl' and p.name not in ('preprocessor.pkl', 'preprocessor copy.pkl'):
                try:
                    import joblib
                    m = joblib.load(str(p))
                    pickled[p.stem] = m
                    LOG.info('Loaded pickled model: %s', p.name)
                except Exception:
                    # fallback to pickle
                    try:
                        import pickle
                        with open(p, 'rb') as fh:
                            m = pickle.load(fh)
                        pickled[p.stem] = m
                        LOG.info('Loaded pickle model: %s', p.name)
                    except Exception:
                        LOG.exception('Failed to load pickled model %s', p)
    except Exception:
        LOG.exception('Pickle model loading failed')

    if not (keras_model or pytorch_model or pickled):
        LOG.info('No usable models found in %s', model_dir)
        return None

    LOG.info('Model loader finished: keras=%s pytorch=%s pickled=%s labels=%s', bool(keras_model), bool(pytorch_model), list(pickled.keys()), len(labels))
    return ModelWrapper(keras_model=keras_model, pytorch_model=pytorch_model, pickled_models=pickled, labels=labels)
