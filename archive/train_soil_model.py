from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam
import os
import tensorflow as tf
from tensorflow.keras import layers

# Correct folder paths (Check folder names capitalization carefully)
train_dir = r'D:\Personal files\SQD_U_ML_DL\archive\Dataset\Train'
test_dir = r'D:\Personal files\SQD_U_ML_DL\archive\Dataset\test'

# Verify dataset folders exist
assert os.path.exists(train_dir), f"Train directory not found at {train_dir}"
assert os.path.exists(test_dir), f"Test directory not found at {test_dir}"

# Data augmentation for training data
train_ds = tf.keras.utils.image_dataset_from_directory(
    train_dir,
    validation_split=0.2,
    subset="training",
    seed=123,
    image_size=(224, 224),
    batch_size=32,
)

data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.2),
    layers.RandomZoom(0.2),
])

# No augmentation for test/validation data - only rescaling
test_gen = ImageDataGenerator(rescale=1./255)

# Load training data
train_data = train_gen.flow_from_directory(
    train_dir,
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical'
)

# Load test/validation data
test_data = test_gen.flow_from_directory(
    test_dir,
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical'
)

print("Train classes:", train_data.class_indices)
print("Test classes:", test_data.class_indices)
print(f"Number of training samples: {train_data.samples}")
print(f"Number of test samples: {test_data.samples}")

# Define CNN model with BatchNorm and Dropout layers
model = Sequential([
    Conv2D(32, (3,3), activation='relu', input_shape=(224,224,3)),
    BatchNormalization(),
    MaxPooling2D(2,2),
    Dropout(0.25),

    Conv2D(64, (3,3), activation='relu'),
    BatchNormalization(),
    MaxPooling2D(2,2),
    Dropout(0.25),

    Conv2D(128, (3,3), activation='relu'),
    BatchNormalization(),
    MaxPooling2D(2,2),
    Dropout(0.4),

    Flatten(),
    Dense(128, activation='relu'),
    Dropout(0.5),
    Dense(train_data.num_classes, activation='softmax')
])

# Compile with lower learning rate
optimizer = Adam(learning_rate=0.0001)
model.compile(optimizer=optimizer, loss='categorical_crossentropy', metrics=['accuracy'])

# Callbacks for training
early_stop = EarlyStopping(monitor='val_loss', patience=7, restore_best_weights=True)
reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3)

# Train the model with validation monitoring
model.fit(
    train_data,
    validation_data=test_data,
    epochs=50,
    callbacks=[early_stop, reduce_lr]
)

# Evaluate final model performance on test data
loss, accuracy = model.evaluate(test_data)
print(f'Test Accuracy: {accuracy*100:.2f}%')
