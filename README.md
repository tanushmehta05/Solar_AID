# Solar-AID: Dual-Stage Solar Panel Defect Detection

Solar-AID is an intelligent dual-stage solar panel inspection system combining deep learning (YOLOv8) and machine learning (Random Forest) to detect and classify defects on solar panels. The project is fully built using self-curated and annotated data and emphasizes accuracy, modularity, and practical deployment.

---

## 📂 Project Structure

```
Solar_AID/
|
├── Models/
│   ├── Yolo Models/
│   │   └── best.pt                 # Trained YOLOv8 model
│   └── RF Models/
│       └── rf_model.pkl           # Trained Random Forest model
|
├── V4/
│   ├── Train/                     # Training images and YOLO labels
│   ├── Test/                      # Test images and YOLO labels
│   ├── Valid/                     # Validation set
│   ├── Train_CSV.csv             # Roboflow exported train CSV
│   ├── Test_CSV.csv              # Roboflow exported test CSV
│   ├── Valid_CSV.csv             # Roboflow exported valid CSV
│   └── train_features_rf.csv     # YOLO extracted features for RF training
|
└── solarpanel-defect.ipynb       # Main pipeline notebook
```

---

## 📊 Dataset & Labeling

- Total labeled images: ~1800+
- Classes:
  - Bird-drop
  - Dusty
  - Clean
  - Electrical-damage
  - Physical-damage
  - Snow

- Labeling & Preprocessing:
  - Annotated using Roboflow (manual and project-based)
  - Class renaming and balancing done via Roboflow
  - Applied augmentations: blur, exposure, rotations, flip, auto-adjust
  - Exported in YOLOv8 format along with label CSVs for RF

---

## 🚀 Pipeline Overview

### 1. YOLOv8 Object Detection

- Model: `yolov8m`
- Task: Multi-class object detection
- Output: `best.pt` saved to `Models/Yolo Models/`
- Trained on 6 defect classes

### 2. Feature Extraction

From YOLO detections:
- `num_boxes`, `avg_conf`, and per-class count features
- Saved as `train_features_rf.csv`

### 3. Random Forest Multi-label Classifier

- Trained using sklearn's `MultiOutputClassifier`
- Input: YOLO features
- Output: multi-label predictions per image
- Model saved at: `Models/RF Models/rf_model.pkl`

---

## 🤝 Inference Flow

```
[User Image Upload]
       ⬇
[YOLOv8 Detection (best.pt)]
       ⬇
[Feature Extraction]
       ⬇
[Random Forest Classification (rf_model.pkl)]
       ⬇
[Final Defect Labels]
```

---

## 🔄 Performance

| Model         | mAP50 | RF Accuracy |
|---------------|--------|--------------|
| YOLOv8        | ~0.83  | -            |
| Random Forest | -      | ~97%         |

---

## 📆 Future Work

- Add real-time web interface with image upload
- Explore thermal+RGB fusion classification
- Introduce attention mechanisms for better segmentation
- Add a whole lot of more models 
- and add AR in the project as well to visualise placement of Solar Panels

---

## 📄 Tech Stack

- Python, Ultralytics YOLOv8
- scikit-learn, pandas, joblib
- Roboflow for annotation and augmentation
- Kaggle & local runtime support

---

## 🔧 How to Run

1. Train YOLO model (if needed) or load `best.pt`
2. Run feature extraction on YOLO detections
3. Train RF model using `train_features_rf.csv`
4. Save both models
5. Predict defects from new images using the combo pipeline

---

Made with frustration by Tanush
