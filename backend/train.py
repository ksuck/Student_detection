import cv2
import os
import numpy as np

dataset_path = "dataset"
faces = []
labels = []
label_map = {}

current_id = 0

# สร้าง labels และอ่าน dataset
for name in os.listdir(dataset_path):
    person_dir = os.path.join(dataset_path, name)
    if not os.path.isdir(person_dir):
        continue

    label_map[current_id] = name  # เก็บ mapping
    for filename in os.listdir(person_dir):
        img_path = os.path.join(person_dir, filename)
        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        faces.append(img)
        labels.append(current_id)

    current_id += 1

faces = np.array(faces)
labels = np.array(labels)

recognizer = cv2.face.LBPHFaceRecognizer_create()
recognizer.train(faces, labels)

recognizer.save("face_model.yml")
np.save("labels.npy", label_map)

print("✅ Training เสร็จสิ้นและบันทึกโมเดลเรียบร้อย")