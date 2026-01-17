from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from pathlib import Path
import traceback

app = Flask(__name__)
CORS(app)
LOG = logging.getLogger(__name__)
LOG.setLevel(logging.INFO)

# Model directory (search nearby folders for model files). Adjust as needed.
BASE = Path(__file__).resolve().parent
MODEL_DIRS = [BASE / 'soil-quality-backend' / 'ml_model', BASE / 'ml_model', BASE / 'models']

keras_model = None
sk_models = {}
preprocessor = None
model_load_errors = {}
last_result = None

def find_model_dirs():
    # start with configured dirs then search workspace for any folder named 'ml_model' or 'models'
    dirs = [p for p in MODEL_DIRS if p.exists()]
    # search recursively for ml_model or models directories under BASE
    try:
        for d in BASE.glob('**/ml_model'):
            if d.is_dir() and d not in dirs:
                dirs.append(d)
        for d in BASE.glob('**/models'):
            if d.is_dir() and d not in dirs:
                dirs.append(d)
    except Exception:
        pass
    return dirs

def load_models():
    global keras_model, sk_models
    global preprocessor
    global model_load_errors
    sk_models = {}
    keras_model = None
    preprocessor = None
    model_load_errors = {}
    dirs = find_model_dirs()
    LOG.info('Model search dirs: %s', dirs)
    # load keras model if present
    try:
        from tensorflow.keras.models import load_model as keras_load
        for d in dirs:
            candidate = d / 'cnn_model.h5'
            if candidate.exists():
                keras_model = keras_load(str(candidate))
                LOG.info('Loaded Keras model from %s', candidate)
                break
    except Exception as e:
        LOG.info('Keras not available or failed to load: %s', e)

    # load sklearn/joblib pickles (search recursively)
    try:
        import joblib
        for d in dirs:
            for p in d.rglob('*.pkl'):
                try:
                    obj = joblib.load(str(p))
                    if p.stem.lower() in ('preprocessor', 'scaler', 'preproc'):
                        preprocessor = obj
                        LOG.info('Loaded preprocessor: %s', p)
                    else:
                        sk_models[p.stem] = obj
                        LOG.info('Loaded SK model: %s', p)
                except Exception as e:
                    LOG.info('Failed to load %s: %s', p, e)
                    model_load_errors[str(p)] = str(e)
    except Exception as e:
        LOG.info('joblib not available or error while loading pickles: %s', e)

    # attempt to load a soil-type cnn model named soil_cnn.h5 or cnn_model.h5
    try:
        from tensorflow.keras.models import load_model as keras_load
        for d in dirs:
            for name in ('soil_cnn.h5', 'cnn_model.h5'):
                candidate = d / name
                if candidate.exists():
                    try:
                        keras_model = keras_load(str(candidate))
                        LOG.info('Loaded Keras model from %s', candidate)
                        break
                    except Exception as e:
                        LOG.info('Failed to load keras model %s: %s', candidate, e)
            if keras_model:
                break
    except Exception as e:
        LOG.info('TensorFlow not available or failed to load .h5 model: %s', e)

    LOG.info('Finished model loading. sk_models: %s, preprocessor loaded: %s, keras_model: %s', list(sk_models.keys()), bool(preprocessor), bool(keras_model))



@app.route('/health', methods=['GET'])
def health():
    # gather discovered files under model dirs
    found_files = []
    for d in find_model_dirs():
        try:
            for p in d.rglob('*'):
                if p.is_file():
                    found_files.append(str(p))
        except Exception:
            pass
    return jsonify({'status':'ok', 'found_files': found_files, 'loaded_models': list(sk_models.keys()), 'preprocessor': bool(preprocessor), 'keras': bool(keras_model), 'model_load_errors': model_load_errors})


@app.route('/', methods=['GET'])
def index():
    """Simple index so browsing to / shows a helpful API summary."""
    return jsonify({
        'app': 'soil-quality-ml-server',
        'routes': ['/health', '/api/detect_disease', '/api/predict_crop', '/api/predict_fertilizer', '/api/predict_npk'],
        'note': 'Use POST on /api/* endpoints. See README for examples.'
    })


@app.route('/api/detect_disease', methods=['POST'])
def detect_disease():
    """Accept multipart/form-data image file and return disease prediction and soil info.

    If keras model present it will be used; otherwise a mock response is returned.
    """
    f = request.files.get('image')
    if not f:
        return jsonify({'error':'no file provided'}), 400

    tmp = BASE / 'tmp_upload.png'
    f.save(tmp)

    if keras_model:
        try:
            from PIL import Image
            import numpy as np
            img = Image.open(tmp).convert('RGB').resize((224,224))
            arr = np.asarray(img).astype('float32')/255.0
            arr = arr.reshape((1,)+arr.shape)
            preds = keras_model.predict(arr)
            probs = preds[0]
            idx = int(probs.argmax())
            conf = float(probs[idx])
            label = f'class_{idx}'
            soil = {'ph': 6.5, 'moisture': 42.0, 'fertility_index': 55}
            return jsonify({'disease_name': label, 'confidence_score': conf, 'treatment_suggestion': 'Follow recommended fungicide', 'extracted_soil_info': soil})
        except Exception as e:
            LOG.exception('Keras prediction failed: %s', e)

    # fallback mock
    soil = {'ph': 6.8, 'moisture': 40.2, 'fertility_index': 52}
    return jsonify({'disease_name':'mock-disease','confidence_score':0.78,'treatment_suggestion':'Apply balanced fertilizer and fungicide','extracted_soil_info':soil})


@app.route('/api/classify_soil_image', methods=['POST'])
def classify_soil_image():
    """Classify a soil image using the loaded CNN model (keras_model) and return
    recommended crops/advice based on predicted soil type. This endpoint is
    intentionally separate from manual-data prediction flows.
    """
    f = request.files.get('image') or request.files.get('file')
    if not f:
        return jsonify({'error': 'No image file provided'}), 400

    tmp = BASE / 'tmp_soil_classify.jpg'
    try:
        f.save(tmp)
    except Exception as e:
        LOG.exception('Failed saving upload: %s', e)
        return jsonify({'error': 'Failed to save uploaded file'}), 500

    # Season-aware recommendation mapping by soil label
    # Each crop includes suitable_seasons: list of 'Kharif', 'Rabi', 'Zaid'
    recommendation_map = {
        'Loamy': {
            'crops': [
                {'name': 'Wheat', 'climate': 'Cool, moderate rainfall', 'tips': 'Use balanced NPK, irrigate biweekly', 'suitable_seasons': ['Rabi']},
                {'name': 'Sugarcane', 'climate': 'Warm, high moisture', 'tips': 'Apply organic fertilizer every month', 'suitable_seasons': ['Kharif', 'Zaid']},
                {'name': 'Maize', 'climate': 'Warm, moderate rainfall', 'tips': 'Hybrid seeds, timely irrigation', 'suitable_seasons': ['Kharif', 'Rabi']},
                {'name': 'Chickpea', 'climate': 'Cool, dry', 'tips': 'Rotate with cereals for soil health', 'suitable_seasons': ['Rabi']}
            ],
            'irrigation': 'Medium water holding capacity. Irrigate every 7-10 days.',
            'soil_advice': 'Loamy soil is ideal for most crops; rotate crops for best results.'
        },
        'Sandy': {
            'crops': [
                {'name': 'Groundnut', 'climate': 'Warm, low to moderate rainfall', 'tips': 'Use frequent light irrigation and organic matter to retain moisture', 'suitable_seasons': ['Kharif']},
                {'name': 'Millet', 'climate': 'Hot, dry', 'tips': 'Low fertilizer; drought-tolerant varieties preferred', 'suitable_seasons': ['Kharif']},
                {'name': 'Moong', 'climate': 'Warm, short duration', 'tips': 'Short duration, fits summer gap', 'suitable_seasons': ['Zaid']}
            ],
            'irrigation': 'Low water retention. Irrigate more frequently with smaller amounts.',
            'soil_advice': 'Add organic matter and mulches to improve moisture retention.'
        },
        'Clay': {
            'crops': [
                {'name': 'Rice', 'climate': 'Warm, high moisture', 'tips': 'Ensure proper puddling and drainage management', 'suitable_seasons': ['Kharif']},
                {'name': 'Cotton', 'climate': 'Warm, moderate rainfall', 'tips': 'Improve aeration and avoid waterlogging', 'suitable_seasons': ['Kharif']},
                {'name': 'Wheat', 'climate': 'Cool, moderate rainfall', 'tips': 'Use balanced NPK, irrigate biweekly', 'suitable_seasons': ['Rabi']}
            ],
            'irrigation': 'High water holding capacity; avoid waterlogging by improving drainage.',
            'soil_advice': 'Incorporate organic matter and avoid compaction.'
        }
    }

    # Helper: determine season from date (India-centric)
    from datetime import datetime
    def get_season(dt=None):
        dt = dt or datetime.now()
        m = dt.month
        if m >= 6 and m <= 9:
            return 'Kharif'
        elif m >= 10 and m <= 11:
            return 'Rabi'
        elif m >= 12 or m <= 2:
            return 'Rabi'
        else:
            return 'Zaid'

    # Allow season override via ?season=Kharif or JSON body
    season = request.args.get('season')
    if not season:
        try:
            if request.is_json:
                season = (request.get_json() or {}).get('season')
        except Exception:
            pass
    if not season:
        season = get_season()

    # Filter crops by season
    def filter_crops_by_season(crops, season):
        return [c for c in crops if 'suitable_seasons' in c and season in c['suitable_seasons']]

    # If a Keras model is available, attempt prediction
    if keras_model:
        try:
            from PIL import Image
            import numpy as np
            img = Image.open(tmp).convert('RGB')
            # model input size: try to infer, fallback to 224x224
            try:
                shape = keras_model.input_shape
                # shape may be (None, h, w, 3) or similar
                if isinstance(shape, (list, tuple)):
                    s = shape[0] if isinstance(shape[0], (list, tuple)) else shape
                    if len(s) >= 3:
                        h = int(s[-3]) if s[-1] == 3 else int(s[1])
                        w = int(s[-2]) if s[-1] == 3 else int(s[2])
                    else:
                        h, w = 224, 224
                else:
                    h, w = 224, 224
            except Exception:
                h, w = 224, 224

            img = img.resize((w, h))
            arr = np.asarray(img).astype('float32') / 255.0
            # ensure shape (1, h, w, 3)
            if arr.ndim == 3:
                arr = arr.reshape((1,) + arr.shape)
            preds = keras_model.predict(arr)
            probs = preds[0]
            idx = int(probs.argmax())
            conf = float(probs[idx])

            # attempt to get class names from model metadata, else generate generic names
            class_names = getattr(keras_model, 'class_names', None)
            if not class_names:
                # try to load a classes.txt sitting next to model
                try:
                    model_dirs = find_model_dirs()
                    class_file = None
                    for d in model_dirs:
                        candidate = d / 'classes.txt'
                        if candidate.exists():
                            class_file = candidate
                            break
                    if class_file:
                        with open(class_file, 'r', encoding='utf-8') as fh:
                            class_names = [l.strip() for l in fh if l.strip()]
                except Exception:
                    class_names = None

            if not class_names:
                class_names = [f'class_{i}' for i in range(len(probs))]

            label = class_names[idx]

            # Build response using mapping if available
            rec = recommendation_map.get(label, None)
            if not rec:
                # fallback: pick a default mapping by simple heuristics
                key = 'Loamy' if 'loam' in label.lower() or 'loamy' in label.lower() else ('Sandy' if 'sand' in label.lower() else ('Clay' if 'clay' in label.lower() else 'Loamy'))
                rec = recommendation_map.get(key)

            filtered_crops = filter_crops_by_season(rec['crops'], season) if rec else []
            response = {
                'soil_type': {'value': label, 'confidence': conf},
                'recommended_crops': filtered_crops,
                'irrigation': rec['irrigation'] if rec else '',
                'soil_advice': rec['soil_advice'] if rec else '',
                'season': season
            }
            return jsonify(response)
        except Exception as e:
            LOG.exception('Soil image classification failed: %s', e)
            return jsonify({'error': 'Model prediction failed', 'details': str(e)}), 500

    # fallback if model not available: attempt simple heuristic using filename or return error
    try:
        # mock response
        rec = recommendation_map['Loamy']
        filtered_crops = filter_crops_by_season(rec['crops'], season)
        return jsonify({
            'soil_type': {'value': 'Loamy', 'confidence': 0.6},
            'recommended_crops': filtered_crops,
            'irrigation': rec['irrigation'],
            'soil_advice': rec['soil_advice'],
            'season': season
        })
    except Exception as e:
        LOG.exception('Fallback classification failed: %s', e)
        return jsonify({'error': 'Classification unavailable'}), 500


def parse_features_from_json(j, keys, defaults):
    vals = []
    for k, d in zip(keys, defaults):
        try:
            vals.append(float(j.get(k, d)))
        except Exception:
            vals.append(float(d))
    return vals


@app.route('/api/predict_crop', methods=['POST'])
def predict_crop():
    j = request.get_json() or {}
    keys = ['temperature','soil_moisture','ph']
    defaults = [25.0, 30.0, 7.0]
    features = parse_features_from_json(j, keys, defaults)

    # If there is a matching pickled model, attempt to predict
    if 'cropRecommendationA1' in sk_models:
        try:
            model = sk_models['cropRecommendationA1']
            rec = model.predict([features])[0]
            conf = 0.8
            return jsonify({'recommended_crop': str(rec), 'confidence_score': conf, 'recommendation':'Use recommended variety', 'soil_info':{'ph':features[2],'moisture':features[1],'fertility_index':50}})
        except Exception as e:
            LOG.info('sk prediction failed: %s', e)

    # fallback heuristic
    ph = features[2]
    if ph < 6:
        crop = 'Soybean'
    elif ph < 7:
        crop = 'Wheat'
    else:
        crop = 'Cotton'
    return jsonify({'recommended_crop':crop,'confidence_score':0.65,'recommendation':'Apply lime if pH low','soil_info':{'ph':ph,'moisture':features[1],'fertility_index':48}})


@app.route('/api/predict_fertilizer', methods=['POST'])
def predict_fertilizer():
    j = request.get_json() or {}
    keys = ['nitrogen','phosphorus','potassium','ph','soil_moisture']
    defaults = [10.0, 10.0, 10.0, 7.0, 30.0]
    features = parse_features_from_json(j, keys, defaults)

    # try to use a pre-trained fertilizer model
    if 'fertilizerRecommendation' in sk_models:
        try:
            model = sk_models['fertilizerRecommendation']
            rec = model.predict([features])[0]
            return jsonify({'fertilizer_type': str(rec), 'confidence_score': 0.75})
        except Exception as e:
            LOG.info('fertilizer model predict failed: %s', e)

    # fallback: simple rule-based suggestion
    n, p, k = features[0], features[1], features[2]
    suggestion = 'Balanced NPK'
    if n < 10:
        suggestion = 'Add Nitrogen rich fertilizer'
    elif p < 10:
        suggestion = 'Add Phosphorus rich fertilizer'
    elif k < 10:
        suggestion = 'Add Potassium rich fertilizer'
    return jsonify({'fertilizer_suggestion': suggestion, 'confidence_score': 0.6})


@app.route('/api/predict_npk', methods=['POST'])
def predict_npk():
    j = request.get_json() or {}
    keys = ['ph','soil_moisture','temperature']
    defaults = [7.0,30.0,25.0]
    features = parse_features_from_json(j, keys, defaults)

    # try to use pickled models for N, P, K
    res = {'nitrogen': None, 'phosphorus': None, 'potassium': None}
    for comp in ['predictNitrogen','predictPhosphorus','predictPotassium']:
        if comp in sk_models:
            try:
                model = sk_models[comp]
                val = float(model.predict([features])[0])
                res_map = {'predictNitrogen':'nitrogen','predictPhosphorus':'phosphorus','predictPotassium':'potassium'}
                res[res_map[comp]] = val
            except Exception as e:
                LOG.info('model %s failed: %s', comp, e)

    # if models not present, apply rough heuristics
    if res['nitrogen'] is None:
        res['nitrogen'] = 10.0 + (features[0]-7.0) * 0.5
    if res['phosphorus'] is None:
        res['phosphorus'] = 8.0
    if res['potassium'] is None:
        res['potassium'] = 9.0

    return jsonify({'npk': res, 'confidence_score': 0.5})


@app.route('/api/submit_manual_data', methods=['POST'])
def submit_manual_data():
    """Accept manual soil data, preprocess, run models and return rich structured JSON.

    Expects JSON body with fields (some optional): temperature, humidity, soil_moisture, ph,
    nitrogen, phosphorus, potassium, soil_type, crop_type (optional), fertilizer_name (optional)
    """
    try:
        j = request.get_json() or {}
    except Exception:
        return jsonify({'error': 'Invalid JSON payload'}), 400

    # required numeric fields (provide defaults if missing)
    def get_num(k, default=None):
        v = j.get(k, None)
        if v is None:
            return default
        try:
            return float(v)
        except Exception:
            return default

    # which models are present (so frontend can display source)
    model_used = {
        "crop_model": bool(sk_models.get("crop_recommendation_model")) or bool(sk_models.get('cropRecommendationA1')),
        "fertilizer_model": bool(sk_models.get("fertilizerRecommendation")),
        "nitrogen_model": bool(sk_models.get("predictNitrogen")),
        "phosphorus_model": bool(sk_models.get("predictPhosphorus")),
        "potassium_model": bool(sk_models.get("predictPotassium")),
        "keras_cnn": bool(keras_model)
    }

    payload = {
        'temperature': get_num('temperature', 25.0),
        'humidity': get_num('humidity', 50.0),
        'soil_moisture': get_num('soil_moisture', 30.0),
        'ph': get_num('ph', 7.0),
        'nitrogen': get_num('nitrogen', 10.0),
        'phosphorus': get_num('phosphorus', 10.0),
        'potassium': get_num('potassium', 10.0),
        'soil_type': (j.get('soil_type') or '').strip(),
        'crop_type': (j.get('crop_type') or '').strip(),
        'fertilizer_name': (j.get('fertilizer_name') or '').strip()
    }

    # basic validation: at least have ph and moisture
    if payload['ph'] is None or payload['soil_moisture'] is None:
        return jsonify({'error': 'Missing required numeric fields: ph, soil_moisture'}), 400

    results = {'recommended_crop': None, 'fertilizer_suggestion': None, 'nutrients': {}, 'soil_type': None, 'confidence_scores': {}}

    # Build feature vector for models. If preprocessor available, let it handle encoding.
    feature_order = ['temperature', 'humidity', 'soil_moisture', 'ph', 'nitrogen', 'phosphorus', 'potassium', 'soil_type']
    X = None
    try:
        if preprocessor is not None:
            # try to create a single-row DataFrame if pandas available, else use dict
            try:
                import pandas as pd
                row = {k: payload.get(k) for k in ['temperature','humidity','soil_moisture','ph','nitrogen','phosphorus','potassium','soil_type','crop_type']}
                df = pd.DataFrame([row])
                X = preprocessor.transform(df)
            except Exception:
                # fallback: if preprocessor has a transform for lists
                try:
                    arr = [payload.get(k) for k in ['temperature','humidity','soil_moisture','ph','nitrogen','phosphorus','potassium','soil_type']]
                    X = preprocessor.transform([arr])
                except Exception:
                    LOG.info('Preprocessor exists but failed to transform. Will use raw features.')
                    X = None

    except Exception as e:
        LOG.info('Preprocessor transform error: %s', e)

    # Helper to call sklearn model safely
    def call_sk_model(name, features):
        if name not in sk_models:
            return None, None
        try:
            model = sk_models[name]
            pred = model.predict(features)
            # attempt to get probability/confidence
            conf = None
            try:
                if hasattr(model, 'predict_proba'):
                    proba = model.predict_proba(features)
                    if hasattr(proba, 'shape'):
                        conf = float(proba.max(axis=1)[0])
            except Exception:
                pass
            return pred, conf
        except Exception as e:
            LOG.info('Model %s predict failed: %s', name, e)
            return None, None

    # 1) Crop recommendation
    try:
        features_for_crop = X if X is not None else [[payload['temperature'], payload['soil_moisture'], payload['ph']]]
        pred, conf = call_sk_model('cropRecommendationA1', features_for_crop)
        if pred is None:
            pred, conf = call_sk_model('crop_recommendation_model', features_for_crop)
        if pred is not None:
            val = str(pred[0])
            results['recommended_crop'] = {'value': val, 'confidence': conf or 0.6, 'advisory': f'Recommended based on soil and nutrient profile.'}
            results['confidence_scores']['crop'] = conf or 0.6
        else:
            # fallback heuristic
            ph = payload['ph']
            if ph < 6:
                val = 'Soybean'
            elif ph < 7:
                val = 'Wheat'
            else:
                val = 'Cotton'
            results['recommended_crop'] = {'value': val, 'confidence': 0.5, 'advisory': 'Heuristic recommendation (no model loaded).'}
            results['confidence_scores']['crop'] = 0.5
    except Exception as e:
        LOG.info('Crop recommendation failed: %s', e)
        results['recommended_crop'] = {'error': 'crop prediction failed'}

    # 2) Fertilizer recommendation
    try:
        features_for_fert = X if X is not None else [[payload['nitrogen'], payload['phosphorus'], payload['potassium'], payload['ph'], payload['soil_moisture']]]
        pred, conf = call_sk_model('fertilizerRecommendation', features_for_fert)
        if pred is not None:
            results['fertilizer_suggestion'] = {'value': str(pred[0]), 'confidence': conf or 0.6, 'advisory': 'Apply as per recommended dosage.'}
            results['confidence_scores']['fertilizer'] = conf or 0.6
        else:
            # simple rule
            n,p,k = payload['nitrogen'], payload['phosphorus'], payload['potassium']
            suggestion = 'Balanced NPK'
            if n < 10:
                suggestion = 'Urea (Nitrogen rich)'
            elif p < 10:
                suggestion = 'DAP (Phosphorus rich)'
            elif k < 10:
                suggestion = 'Muriate of Potash (Potassium rich)'
            results['fertilizer_suggestion'] = {'value': suggestion, 'confidence': 0.55, 'advisory': 'Rule-based suggestion.'}
            results['confidence_scores']['fertilizer'] = 0.55
    except Exception as e:
        LOG.info('Fertilizer recommendation failed: %s', e)
        results['fertilizer_suggestion'] = {'error': 'fertilizer prediction failed'}

    # 3) Nutrient (NPK) predictions
    try:
        features_for_npk = X if X is not None else [[payload['ph'], payload['soil_moisture'], payload['temperature']]]
        # nitrogen
        pred_n, conf_n = call_sk_model('predictNitrogen', features_for_npk)
        pred_p, conf_p = call_sk_model('predictPhosphorus', features_for_npk)
        pred_k, conf_k = call_sk_model('predictPotassium', features_for_npk)
        # use model outputs if available else heuristics
        if pred_n is not None:
            n_val = float(pred_n[0])
            results['nutrients']['nitrogen'] = {'predicted': n_val, 'advisory': 'Model predicted', 'confidence': conf_n or None}
        else:
            n_val = 10.0 + (payload['ph'] - 7.0) * 0.5
            results['nutrients']['nitrogen'] = {'predicted': n_val, 'advisory': 'Heuristic estimate', 'confidence': None}

        if pred_p is not None:
            p_val = float(pred_p[0])
            results['nutrients']['phosphorus'] = {'predicted': p_val, 'advisory': 'Model predicted', 'confidence': conf_p or None}
        else:
            p_val = 8.0
            results['nutrients']['phosphorus'] = {'predicted': p_val, 'advisory': 'Heuristic estimate', 'confidence': None}

        if pred_k is not None:
            k_val = float(pred_k[0])
            results['nutrients']['potassium'] = {'predicted': k_val, 'advisory': 'Model predicted', 'confidence': conf_k or None}
        else:
            k_val = 9.0
            results['nutrients']['potassium'] = {'predicted': k_val, 'advisory': 'Heuristic estimate', 'confidence': None}
    except Exception as e:
        LOG.info('NPK prediction failed: %s', e)
        results['nutrients'] = {'error': 'npk failed'}

    # 4) Soil type classification using keras_model if present and image provided
    try:
        soil_type_val = None
        soil_conf = None
        if 'soil_type' in j and j.get('soil_type'):
            soil_type_val = j.get('soil_type')
            soil_conf = None
        elif keras_model and request.files.get('image'):
            # run image classification
            try:
                from PIL import Image
                import numpy as np
                f = request.files.get('image')
                tmp = BASE / 'tmp_upload2.png'
                f.save(tmp)
                img = Image.open(tmp).convert('RGB').resize((224,224))
                arr = np.asarray(img).astype('float32')/255.0
                arr = arr.reshape((1,)+arr.shape)
                preds = keras_model.predict(arr)
                idx = int(preds[0].argmax())
                soil_type_val = f'soil_class_{idx}'
                soil_conf = float(preds[0].max())
            except Exception as e:
                LOG.info('Soil image classification failed: %s', e)

        results['soil_type'] = {'value': soil_type_val or payload['soil_type'] or 'Unknown', 'confidence': soil_conf}
        results['confidence_scores']['soil'] = soil_conf or None
    except Exception as e:
        LOG.info('Soil type block failed: %s', e)
        results['soil_type'] = {'error': 'soil type classification failed'}

    # Add some generic other suggestions
    other = []
    if results.get('nutrients') and isinstance(results['nutrients'].get('nitrogen', {}), dict):
        if results['nutrients']['nitrogen'].get('predicted', 0) < 10:
            other.append('Consider adding Nitrogen rich fertilizer (e.g., Urea)')
    other.append('Monitor soil pH every 3 months')

    results['other_suggestions'] = other
    # expose which models were used/available
    try:
        results['model_used'] = model_used
    except Exception:
        results['model_used'] = {}

    # store last result so frontend can fetch it if needed
    try:
        global last_result
        last_result = results
    except Exception:
        LOG.info('Failed to persist last_result in memory')

    return jsonify(results)



@app.route('/predict-manual', methods=['POST'])
def predict_manual():
    """Accepts the 9-field manual payload and returns combined predictions.

    Expected fields (JSON or form):
      - temperature, humidity, soil_moisture, soil_type, crop_type,
        nitrogen, potassium, phosphorus, fertilizer_name
    """
    j = request.get_json() or {}

    # Helper to coerce floats with defaults
    def fget(key, default):
        try:
            return float(j.get(key, default))
        except Exception:
            return float(default)

    temperature = fget('temperature', 25.0)
    humidity = fget('humidity', 50.0)
    soil_moisture = fget('soil_moisture', 30.0)
    soil_type = j.get('soil_type', '')
    crop_type = j.get('crop_type', '')
    nitrogen = fget('nitrogen', 10.0)
    phosphorus = fget('phosphorus', 10.0)
    potassium = fget('potassium', 10.0)
    fertilizer_name = j.get('fertilizer_name', '')

    # --- Crop prediction (reuse logic from /api/predict_crop) ---
    ph = float(j.get('ph', 7.0))
    crop_result = {}
    try:
        keys = ['temperature', 'soil_moisture', 'ph']
        features = [temperature, soil_moisture, ph]
        if 'cropRecommendationA1' in sk_models:
            model = sk_models['cropRecommendationA1']
            rec = model.predict([features])[0]
            crop_result = {'recommended_crop': str(rec), 'confidence_score': 0.8, 'recommendation': 'Use recommended variety', 'soil_info': {'ph': ph, 'moisture': soil_moisture, 'fertility_index': 50}}
        else:
            if ph < 6:
                crop = 'Soybean'
            elif ph < 7:
                crop = 'Wheat'
            else:
                crop = 'Cotton'
            crop_result = {'recommended_crop': crop, 'confidence_score': 0.65, 'recommendation': 'Apply lime if pH low', 'soil_info': {'ph': ph, 'moisture': soil_moisture, 'fertility_index': 48}}
    except Exception as e:
        LOG.info('predict_manual crop block failed: %s', e)
        crop_result = {'error': 'crop prediction failed'}

    # --- Fertilizer prediction (reuse logic from /api/predict_fertilizer) ---
    fert_result = {}
    try:
        keys = ['nitrogen', 'phosphorus', 'potassium', 'ph', 'soil_moisture']
        features = [nitrogen, phosphorus, potassium, ph, soil_moisture]
        if 'fertilizerRecommendation' in sk_models:
            model = sk_models['fertilizerRecommendation']
            rec = model.predict([features])[0]
            fert_result = {'fertilizer_type': str(rec), 'confidence_score': 0.75}
        else:
            suggestion = 'Balanced NPK'
            if nitrogen < 10:
                suggestion = 'Add Nitrogen rich fertilizer'
            elif phosphorus < 10:
                suggestion = 'Add Phosphorus rich fertilizer'
            elif potassium < 10:
                suggestion = 'Add Potassium rich fertilizer'
            fert_result = {'fertilizer_suggestion': suggestion, 'confidence_score': 0.6}
    except Exception as e:
        LOG.info('predict_manual fertilizer block failed: %s', e)
        fert_result = {'error': 'fertilizer prediction failed'}

    # --- NPK estimation (reuse logic from /api/predict_npk) ---
    npk_result = {}
    try:
        features = [ph, soil_moisture, temperature]
        res = {'nitrogen': None, 'phosphorus': None, 'potassium': None}
        for comp in ['predictNitrogen', 'predictPhosphorus', 'predictPotassium']:
            if comp in sk_models:
                try:
                    model = sk_models[comp]
                    val = float(model.predict([features])[0])
                    res_map = {'predictNitrogen': 'nitrogen', 'predictPhosphorus': 'phosphorus', 'predictPotassium': 'potassium'}
                    res[res_map[comp]] = val
                except Exception as e:
                    LOG.info('model %s failed in predict_manual: %s', comp, e)

        if res['nitrogen'] is None:
            res['nitrogen'] = 10.0 + (features[0]-7.0) * 0.5
        if res['phosphorus'] is None:
            res['phosphorus'] = 8.0
        if res['potassium'] is None:
            res['potassium'] = 9.0

        npk_result = {'npk': res, 'confidence_score': 0.5}
    except Exception as e:
        LOG.info('predict_manual npk block failed: %s', e)
        npk_result = {'error': 'npk estimation failed'}

    # Compute user-provided crop suitability using simple heuristics
    def suitability_for(crop, ph_val, moisture_val):
        # ideal ranges for a few crops (ph_min, ph_max, moisture_min, moisture_max)
        ideals = {
            'Wheat': (6.0, 7.5, 20, 40),
            'Maize': (5.5, 7.0, 25, 50),
            'Soybean': (5.0, 6.5, 20, 45),
            'Cotton': (6.0, 8.0, 15, 35),
        }
        if not crop:
            return {'score': None, 'message': 'No crop provided'}
        key = crop.strip().capitalize()
        # allow some flexible matching
        for k in ideals.keys():
            if key.lower() == k.lower() or key.lower() in k.lower() or k.lower() in key.lower():
                ph_min, ph_max, m_min, m_max = ideals[k]
                ph_score = max(0, 1 - (abs((ph_val - (ph_min+ph_max)/2) / (ph_max-ph_min)) ))
                m_score = max(0, 1 - (abs((moisture_val - (m_min+m_max)/2) / (m_max-m_min)) ))
                # average and convert to 0-100
                score = int(((ph_score + m_score) / 2) * 100)
                msg = 'Suitable' if score >= 60 else ('Marginal' if score >= 35 else 'Not suitable')
                return {'score': score, 'message': msg, 'ideal_ranges': {'ph': [ph_min, ph_max], 'moisture': [m_min, m_max]}}
        # unknown crop: provide rough guidance based on pH
        score = int(max(0, 100 - abs(ph_val - 7.0) * 20))
        msg = 'Roughly suitable' if score >= 50 else 'Unknown crop, limited guidance'
        return {'score': score, 'message': msg}

    user_crop_assessment = suitability_for(crop_type, ph, soil_moisture)

    return jsonify({'inputs': {'temperature': temperature, 'humidity': humidity, 'soil_moisture': soil_moisture, 'soil_type': soil_type, 'crop_type': crop_type, 'nitrogen': nitrogen, 'phosphorus': phosphorus, 'potassium': potassium, 'fertilizer_name': fertilizer_name}, 'crop': crop_result, 'fertilizer': fert_result, 'npk': npk_result, 'user_crop': user_crop_assessment})


@app.route('/api/last_result', methods=['GET'])
def get_last_result():
    """Return the last prediction/result stored in memory (if any)."""
    try:
        if last_result is None:
            return jsonify({'message': 'no recent prediction available'}), 204
        return jsonify(last_result)
    except Exception as e:
        LOG.info('Error returning last_result: %s', e)
        return jsonify({'error': 'failed to return last result'}), 500


if __name__ == '__main__':
    try:
        load_models()
        # default port set to 5001 to match frontend default REACT_APP_API_URL
        app.run(port=5001, debug=True)
    except Exception:
        LOG.error('Failed to start server:\n%s', traceback.format_exc())
