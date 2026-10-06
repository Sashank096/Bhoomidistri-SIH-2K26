# BhoomiDrishti

### AI-Powered Land Acquisition Delay Risk Prediction & Management System

BhoomiDrishti is an AI/ML-based project management and decision-support system designed to help government officers monitor land acquisition projects, identify parcels that are likely to face delays, understand the reasons behind the predicted risk, and prioritize cases that require intervention.

The system combines **project data, land parcel information, affected-family records, compensation status, approvals, legal disputes, documentation, rehabilitation progress, possession status, and historical outcomes** to generate an explainable delay-risk prediction.

---
Yes. Add a **Demo Login Credentials** section to the README.

However, one important correction: **do not put real production passwords or OTP secrets in a public GitHub repository.** Since these appear to be development/test credentials, label them explicitly as demo credentials.

Add this section after the **Role-Based Access** section:

````markdown
# 🔐 Demo Login Credentials

> ⚠️ These credentials are for local development/demo purposes only.
> Never use these passwords or OTPs in a production environment.
> Do not commit real production credentials to GitHub.

## Administrator

| Field | Value |
|---|---|
| Email | `admin@gov.in` |
| Password | `Admin123` |
| Role | Administrator |

### Administrator Access

The Administrator can:

- Create and manage projects
- Upload project data
- Validate project data
- Run ML risk analysis
- View critical parcels
- Assign officers
- Assign deadlines
- Review officer tasks
- Approve completed tasks
- Monitor project-level risk

---

## Officer Accounts

### Officer 102

| Field | Value |
|---|---|
| Officer ID | `officer-102` |
| Password | `OfficerGov@2026` |
| Role | Officer |

### Officer 103

| Field | Value |
|---|---|
| Officer ID | `officer-103` |
| Password | `OfficerGov@2026` |
| Role | Officer |

---

## Development OTP

For local development/testing:

```text
842916
````

> The OTP above is a development OTP only. A production deployment should use a proper OTP service and should never hard-code OTP values.

---

# 🔑 Authentication Flow

The application uses role-based authentication.

```text
User
  │
  ↓
Login
  │
  ↓
Credentials Validation
  │
  ↓
OTP / 2FA Verification
  │
  ↓
Role Verification
  │
  ├───────────────┐
  ↓               ↓
Administrator    Officer
  │               │
  ↓               ↓
Admin Dashboard  Officer Workspace
```

Officer API routes require an authenticated officer session.

Administrator routes require an authenticated administrator session.

---

# 🛡️ Security Note

The credentials shown in this README are intended only for development/demo environments.

For production:

* Store passwords securely using password hashing.
* Store secrets in environment variables.
* Never hard-code passwords in source code.
* Never commit `.env` files to GitHub.
* Use a secure OTP provider.
* Use proper session/token management.
* Implement password reset and account recovery.
* Enable HTTPS.
* Apply role-based authorization on backend APIs.

````



**One more thing:** if `admin@gov.in`, `Admin123`, the officer passwords, or the OTP are actually being used on a publicly accessible deployment, **change them immediately**. Putting credentials in a README—even for a government-themed demo—is a bad security practice.

## 🎯 Problem Statement

Land acquisition projects involve multiple stages such as documentation, approvals, compensation, legal processes, rehabilitation, and possession.

Delays can occur when one or more of these stages remain pending or face disputes.

Traditional monitoring systems mainly show the current status of a project but do not proactively identify **which parcels are most likely to be delayed and why**.

### BhoomiDrishti Solution

BhoomiDrishti uses machine learning to:

* Predict potential land-acquisition delay risk.
* Identify critical land parcels.
* Explain the major factors contributing to the risk.
* Track project and parcel-level progress.
* Help officers prioritize intervention.
* Monitor outcomes after intervention.

---

# 🚀 Key Features

## 1. Project Management

Administrators can create and manage land acquisition projects.

Each project can contain:

* Project information
* Location information
* Land parcels
* Affected families
* Compensation details
* Approval records
* Legal disputes
* Documents
* Rehabilitation & resettlement progress
* Possession information
* Stakeholders
* Stage timelines
* Intervention outcomes

---

## 2. Data Input & Management

The system supports structured project data including:

* Survey numbers
* Parcel area
* Land ownership
* Acquisition status
* Family information
* Compensation information
* Approval status
* Legal dispute information
* Required documents
* Rehabilitation status
* Possession status

---

## 3. Data Validation

Before machine-learning prediction, input data is checked for:

* Missing values
* Duplicate records
* Invalid values
* Incorrect data types
* Invalid relationships
* Inconsistent project/parcel information

This helps prevent poor-quality data from entering the ML pipeline.

---

# 🤖 Machine Learning Pipeline

The BhoomiDrishti ML pipeline follows these major stages:

```text
Raw Project Data
       ↓
Data Collection
       ↓
Data Validation
       ↓
Data Cleaning
       ↓
Exploratory Data Analysis
       ↓
Feature Engineering
       ↓
Feature Selection
       ↓
Model Training
       ↓
Model Evaluation
       ↓
Risk Prediction
       ↓
Explainable Risk Factors
       ↓
Officer Intervention
       ↓
Outcome Tracking
```

---

# 🧠 Machine Learning Model

The current ML pipeline uses a **Random Forest Regressor** for predicting land-acquisition delay risk.

The trained model and preprocessing objects are stored separately so that the same preprocessing pipeline can be applied when making predictions on new project data.

### Current ML Components

```text
models/
├── random_forest_model.pkl
└── feature_scaler.pkl
```

The model expects the engineered feature set generated by the feature-engineering pipeline.

---

# 📊 Risk Prediction

The model generates a prediction that can be converted into a risk category.

Example:

|  Risk Score | Risk Level |
| ----------: | ---------- |
|    0 – 0.30 | Low        |
| 0.31 – 0.60 | Medium     |
| 0.61 – 0.80 | High       |
| 0.81 – 1.00 | Critical   |

> The exact thresholds can be adjusted based on the final model output and validation results.

---

# 🔍 Explainable AI

BhoomiDrishti does not only provide a risk prediction.

It also attempts to answer:

> **"Why is this parcel considered high risk?"**

Possible contributing factors include:

* Pending approvals
* High approval-pending ratio
* Legal disputes
* Compensation delays
* Missing documents
* Rehabilitation delays
* Ownership issues
* Long-pending acquisition stages
* Possession delays

This allows officers to understand the prediction and take targeted action.

---

# 🗂️ Dataset Structure

The project dataset is organized into multiple related sheets.

```text
BhoomiDrishti_Dataset.xlsx

01_Project_Master
02_Location_GIS
03_Land_Parcels
04_Affected_Families
05_Compensation
06_Approvals
07_Legal_Disputes
08_Documents
09_RR_Progress
10_Possession
11_Stakeholders
12_Stage_Timeline
13_Interventions_Outcomes
14_ML_Project_Features
15_ML_Targets
```

The dataset is transformed into an ML-ready dataset during preprocessing.

---

# 📁 Project Structure

```text
BhoomiDrishti/
│
├── data/
│   ├── raw/
│   │   └── BhoomiDrishti_Dataset.xlsx
│   │
│   └── processed/
│       ├── bhoomidrishti_ml_dataset.csv
│       └── engineered_ml_dataset.csv
│
├── notebooks/
│   ├── 01_Dataset_Preparation.ipynb
│   ├── 02_Exploratory_Data_Analysis.ipynb
│   ├── 03_Feature_Engineering.ipynb
│   └── 04_Model_Training.ipynb
│
├── models/
│   ├── random_forest_model.pkl
│   └── feature_scaler.pkl
│
├── app/
│   └── ...
│
├── tests/
│   └── ...
│
├── requirements.txt
├── README.md
└── .gitignore
```

---

# 📓 ML Notebooks

## Notebook 01 — Dataset Preparation

Responsibilities:

* Load the Excel workbook.
* Read all dataset sheets.
* Inspect columns.
* Check missing values.
* Check duplicate records.
* Check data types.
* Examine relationships between datasets.
* Prepare the ML dataset.

Output:

```text
data/processed/bhoomidrishti_ml_dataset.csv
```

---

## Notebook 02 — Exploratory Data Analysis

Responsibilities:

* Understand the dataset.
* Analyze distributions.
* Identify missing values.
* Study relationships between variables.
* Analyze project and parcel characteristics.
* Identify patterns associated with delays.

---

## Notebook 03 — Feature Engineering

Responsibilities:

* Create ML-ready features.
* Transform raw project information.
* Generate meaningful ratios and indicators.
* Handle categorical and numerical variables.
* Prepare the final feature matrix.

Example engineered feature:

```text
Pending_Approval_Ratio
```

---

## Notebook 04 — Model Training

Responsibilities:

* Prepare training data.
* Scale required features.
* Train the machine-learning model.
* Evaluate model performance.
* Save the trained model.
* Save the feature scaler.

Generated files:

```text
models/random_forest_model.pkl
models/feature_scaler.pkl
```

---

# 🖥️ Application Modules

The BhoomiDrishti application is designed around role-based access.

### Administrator

Can:

* Create projects.
* Upload project data.
* Validate data.
* Run risk analysis.
* View critical parcels.
* Assign officers.
* Assign deadlines.
* Review tasks.
* Approve completed work.

### Officer

Can:

* View assigned parcels.
* View risk predictions.
* Understand risk factors.
* Perform interventions.
* Update parcel/project status.
* Record outcomes.

### Viewer

Can:

* View project information.
* View dashboards.
* View risk summaries.
* Monitor project progress.

---

# 📊 Dashboard

The dashboard provides a high-level view of project status.

Example KPIs:

```text
Total Projects
Total Parcels
High-Risk Parcels
Critical Parcels
Pending Approvals
Pending Compensation
Legal Disputes
```

It can also display:

* Risk distribution
* Stage-wise progress
* Critical parcel list
* Project progress
* Intervention status

---

# ⚠️ Critical Parcel Identification

The system prioritizes parcels requiring immediate attention.

Example:

```text
Parcel ID: P-1024

Risk Level: CRITICAL

Main Factors:
- Approval pending
- Compensation pending
- Legal dispute
- Documentation incomplete

Recommended Action:
Prioritize officer intervention.
```

---

# 👨‍💼 Officer Assignment

Administrators can assign critical cases to officers.

Example workflow:

```text
Critical Parcel
      ↓
Administrator Review
      ↓
Officer Assignment
      ↓
Deadline Assignment
      ↓
Officer Intervention
      ↓
Status Update
      ↓
Outcome Recording
```

---

# 🛠️ Technology Stack

### Programming

* Python
* SQL

### Machine Learning

* Scikit-learn
* Pandas
* NumPy
* Joblib

### Data Analysis

* Pandas
* Matplotlib
* Seaborn

### Application

* Streamlit

### Database

* Supabase / PostgreSQL

### Development

* Jupyter Notebook
* Visual Studio Code
* Git
* GitHub

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone https://github.com/kailashpachipala/BhoomiDrishti.git
```

```bash
cd BhoomiDrishti
```

---

## 2. Create a virtual environment

Windows:

```bash
py -m venv .venv
```

---

## 3. Activate the virtual environment

```bash
.venv\Scripts\activate
```

---

## 4. Install dependencies

```bash
pip install -r requirements.txt
```

---

# ▶️ Running the Application

After activating the virtual environment:

```bash
streamlit run app.py
```

If the application entry point is located inside another directory, use the appropriate path:

```bash
streamlit run app/app.py
```

The terminal will provide a local URL where the application can be opened in the browser.

---

# 🧪 Running Tests

Run the project tests using:

```bash
pytest
```

For more detailed output:

```bash
pytest -v
```

---

# 🔬 ML Prediction Example

A simplified prediction workflow looks like:

```python
import joblib

model = joblib.load("models/random_forest_model.pkl")
scaler = joblib.load("models/feature_scaler.pkl")

scaled_features = scaler.transform(features)

prediction = model.predict(scaled_features)
```

The prediction is then converted into an appropriate risk level for the application.

---

# 🔐 Role-Based Access

BhoomiDrishti follows role-based access control.

```text
                 Login
                   │
        ┌──────────┼──────────┐
        ↓          ↓          ↓
     Admin      Officer     Viewer
        │          │          │
        ↓          ↓          ↓
   Management   Assigned    Monitoring
   & Analysis     Cases       Only
```

---

# 📌 Example Use Case

Suppose a land acquisition project contains **750 parcels**.

The system processes information such as:

```text
Parcel ownership
        +
Approval status
        +
Compensation status
        +
Legal disputes
        +
Documents
        +
RR progress
        +
Possession status
```

The ML model identifies a subset of parcels with elevated delay risk.

For example:

```text
750 Total Parcels
        ↓
ML Risk Analysis
        ↓
120 High Risk
        ↓
35 Critical
        ↓
Officer Prioritization
```

Officers can then focus on the 35 critical parcels instead of manually reviewing all 750 parcels with equal priority.

---

# 🎯 Project Objectives

The main objectives of BhoomiDrishti are to:

1. Digitize land acquisition project monitoring.
2. Centralize project and parcel information.
3. Validate project data before analysis.
4. Predict potential delay risk.
5. Identify critical parcels.
6. Explain the factors contributing to risk.
7. Support timely officer intervention.
8. Track intervention outcomes.
9. Improve decision-making using data and machine learning.

---

# 🔮 Future Enhancements

Potential future improvements include:

* XGBoost and other model comparison.
* Advanced explainability using SHAP.
* GIS-based parcel visualization.
* Interactive maps.
* Satellite imagery integration.
* Automated alerts.
* Email/SMS notifications.
* Time-series delay prediction.
* More advanced risk forecasting.
* Model monitoring and retraining.
* Cloud deployment.
* Real-time database integration.
* Advanced analytics dashboards.

---

# ⚠️ Important Note

BhoomiDrishti is a **decision-support system**, not a replacement for government officers or legal authorities.

Machine-learning predictions should be used as an additional source of information alongside official records, legal requirements, field verification, and officer judgment.

---

# 👥 Project

**Project Name:** BhoomiDrishti

**Domain:** Artificial Intelligence / Machine Learning / Land Acquisition Management

**Primary Technologies:** Python, Machine Learning, Streamlit, SQL, Supabase

**Repository:** GitHub

---

# 📄 License

This project is intended for educational, research, and project-development purposes.
