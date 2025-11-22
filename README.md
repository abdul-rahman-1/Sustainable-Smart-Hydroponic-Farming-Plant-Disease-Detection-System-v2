# 🌿 LeafGuard — Smart IoT-Based Hydroponic Plant Monitoring & AI Disease Detection

---

## Overview

LeafLens is an advanced AI and computer vision project designed to identify diseases in plant leaves using image analysis. It empowers farmers, horticulturists, and researchers to detect plant diseases early, preventing crop loss and optimizing agricultural productivity.

The system combines **AI-based image processing**, **real-time webcam input**, and a **modular pipeline** for data preprocessing, training, testing, and inference.

---

## 🧩 Problem Statement

Plant diseases pose a serious threat to global agriculture, often leading to significant crop loss. Early detection is challenging due to:

* Lack of accessible diagnostic tools for farmers
* Visual similarity between healthy and diseased leaves
* Delays in laboratory testing

**LeafLens** solves this by providing instant, AI-driven diagnosis from leaf images, enabling prompt intervention.

---

## 🎯 Objectives

1. Build a robust AI model for classifying plant leaf diseases.
2. Enable live testing through camera input for real-time detection.
3. Provide a comprehensive pipeline: preprocessing → training → validation → inference.
4. Allow future scalability and integration with web, mobile, or cloud applications.

---

## ⚙️ Technical Workflow

### 1. Data Preprocessing

* Collection of leaf images from datasets (e.g., PlantVillage) or custom captures.
* Image augmentation: rotation, flipping, scaling to enhance model generalization.
* Normalization and resizing to fit the input requirements of the neural network.
* Splitting dataset into training, validation, and testing sets.

### 2. Model Training

* Convolutional Neural Network (CNN) architecture used for feature extraction and classification.
* Training conducted in Jupyter notebooks with frameworks like TensorFlow/Keras or PyTorch.
* Metrics monitored: accuracy, loss, precision, recall.
* Techniques applied: dropout, batch normalization, and data augmentation to reduce overfitting.

### 3. Testing & Inference

* Notebook/script-based inference on unseen images.
* Real-time webcam feed integration (via `TEST-cam.py`) for live prediction.
* Predictions include:

  * Disease label
  * Confidence percentage
  * Signal indicator: Green (Healthy), Yellow (Moderate), Red (Severe)

### 4. User Interaction

* Minimal interface via scripts or notebooks.
* Future-ready for web or mobile UI integration.

---

## 🌟 Achievements

* Successfully trained a CNN model for leaf disease classification.
* Enabled **real-time prediction** using live camera feed.
* Modular and extensible code structure for research or deployment.
* Demonstrated integration of preprocessing, training, testing, and inference in one workflow.

---

## 📊 Challenges & Insights

* **Data Imbalance**: Certain diseases had fewer samples, addressed via augmentation.
* **Overfitting vs Generalization**: Regularization techniques and careful training mitigated overfitting.
* **Real-Time Inference**: Optimization of preprocessing and model inference for live webcam detection.
* **Bridging Research & Application**: Adapting notebook code into reusable scripts for real-world use.

---

## 🔮 Future Enhancements

* **User-Friendly UI**: Web or mobile interface for farmer-friendly operation.
* **Cloud Integration**: API for scalable, multi-device usage.
* **Expanded Dataset**: More plants, diseases, and environmental conditions.
* **Edge Deployment**: Lightweight models for mobile/offline usage.
* **Explainability**: Grad-CAM or saliency maps for visual explanations of predictions.
* **Actionable Advice**: Post-diagnosis suggestions for treatment and prevention.

---

## 🏆 Impact

LeafLens enables:

* Faster disease diagnosis for healthier crops
* Reduced use of unnecessary chemicals
* Data-driven farming decisions
* Enhanced yield and agricultural efficiency

---

## 📌 Key Takeaways

* AI can significantly assist in agriculture and plant health.
* Modular and well-documented pipelines ensure reproducibility and scalability.
* Early detection is critical to preventing crop loss.

---

## 🎨 Visual Representation

```
[ Leaf Image ] ---> [ Preprocessing ] ---> [ CNN Model ] ---> [ Prediction ] ---> [ Label + Confidence + Signal ]
```

* LeafLens pipeline transforms raw leaf images into actionable predictions.
* Signal color coding helps instantly interpret the severity of disease.

---

## 📂 Repository Components

* **Train_plant_disease.ipynb**: Dataset exploration and model training.
* **Test_plant_disease.ipynb / .py**: Inference on test images.
* **TEST-cam.py**: Live webcam input for real-time predictions.
* **Supporting data files**: Image datasets, model checkpoints, and preprocessing scripts.

---

## ⚡ Usage (Conceptual)

1. Load the dataset and preprocess images.
2. Train the CNN model using the notebook.
3. Validate the model on test images.
4. Use live camera feed to capture leaves and receive predictions.
5. Interpret output: label, confidence, and signal color.

---

## 📌 Summary

LeafLens offers a complete AI-powered solution for plant disease detection. By combining deep learning with real-time image capture, it provides fast, reliable, and actionable insights to improve agricultural productivity and sustainability.
