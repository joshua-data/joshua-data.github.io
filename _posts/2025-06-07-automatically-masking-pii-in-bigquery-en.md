---
title: "Automatically Masking PII in BigQuery"
lang: en
tags:
  - data-engineering
  - data-governance-platform
  - sql-bigquery
---

# Table of Contents
1. **Introduction**
2. **Background**
3. **Hands-on Walkthrough**
4. **Deeper Notes**
5. **Closing Thoughts**

---

# 1. Introduction

> "I needed to mask PII."

![]({{ site.baseurl }}/assets/2025-06-07-automatically-masking-pii-in-bigquery/1.webp)

> Query-time logic that automatically detects PII and masks it

While expanding our ELT pipelines recently, I had to implement **logic that automatically detects PII in queries and masks it**. A specific STRING-typed column contained a mix of PII and non-PII, and the core challenge was to handle this cleanly so that internal data utilization could go up while still fully complying with privacy regulations.

While brainstorming with my team lead, I came across GCP's **Sensitive Data Protection** service for the first time, and we ended up adopting an environment that lets us call this service in the form of a BigQuery function. (Colleagues from the DevOps and security teams reviewed it with us.)

![]({{ site.baseurl }}/assets/2025-06-07-automatically-masking-pii-in-bigquery/2.webp)

> Sensitive Data Protection

Adopting this environment required not just data engineering skills, but also a fairly broad understanding of DevOps and cloud infrastructure. At first I felt overwhelmed — "this looks really hard, can I actually pull this off?" — but once I sat down and looked at it carefully, it turned out not to be that complicated.

I wrote this post so that anyone — including data analysts — can follow along and try this themselves. I'll walk through, step by step, how I built out "automatic PII masking in BigQuery" using GCP Sensitive Data Protection.

---

# 2. Background

> "There was a specific reason I chose Sensitive Data Protection."

The company I work at runs its DW on GCP, and we strictly separate PII (personally identifiable information) from Non-PII. PII-only and Non-PII-only projects are split apart, and BigQuery follows the same boundary. In particular, the PII project is locked behind a closed network that's cut off from the public internet, in line with our internal privacy policy and applicable regulations.

> **💡 [Author's Note] What is PII?**
>
> PII stands for "Personally Identifiable Information" — any information that can identify an individual. Examples include name, address, phone number, national ID number, and so on.

![]({{ site.baseurl }}/assets/2025-06-07-automatically-masking-pii-in-bigquery/3.webp)

> A hypothetical PII `dim__users` table

In this environment, I was given a specific goal for the data team: build a **batch pipeline that masks (de-identifies) the PII portion of a column that contains a mix of PII and non-PII** in a PII table. In other words, a specific Transformation Task in an Airflow DAG needed to carry "BigQuery-side logic that de-identifies PII as part of the transformation."

> **💡 [Author's Note] Why bother with masking?**
>
> Because I wanted to keep PII fully protected, while still letting the rest of the organization use the non-PII content as natural-language data.

![]({{ site.baseurl }}/assets/2025-06-07-automatically-masking-pii-in-bigquery/4.webp)

> An Airflow DAG Transformation Task whose role is "BigQuery-side logic that de-identifies PII as part of the transformation"

Before landing on Sensitive Data Protection, I evaluated several other options. Each had blockers.

### Option 1. OpenAI API

I thought about something like the snippet below — feeding the PII column to OpenAI and asking the LLM to mask it. But that means PII data leaves the company and goes to a third party (OpenAI), which is incompatible with our internal security policy.

```python
prompt_system = "..."

masked_texts = []
for i in range(len(df)):

  text = df.loc[i, 'pii']
  prompt_individual = f"""
    Please output the following text with all PII masked.
    Use asterisks (*) for the mask.
    Text: {text}
  """

  result = openai_client.chat.completions.create(
    model='xxx',
    max_tokens=1234,
    n=1,
    temperature=0,
    stop=None,
    messages=[
       {"role": "system", "content": prompt_system},
       {"role": "user", "content": prompt_individual}
    ]
  )

  masked_text = result.choices[0].message.content.strip()
  masked_texts.append(masked_text)

df['pii_masked'] = masked_texts
df = df[['column_a', 'column_b', 'pii_masked']]

to_table = bigquery_client.get_table(to_table_id)
bigquery_client.load_table_from_dataframe(df, to_table)
```

### Option 2. Gemini

Staying inside the Google ecosystem is better than OpenAI, but LLMs respond **probabilistically**, so output consistency isn't guaranteed. A bad day where PII leaks through unmasked is exactly the kind of incident we want to avoid.

### Option 3. Regex-based user-defined functions

I considered hand-defining regex patterns for the major PII types — national ID number, email, phone — and masking with UDFs. But any new, unseen PII pattern would be a **"leak first, fix later"** situation, and hand-maintaining a library of regexes is a poor use of effort.

### Option 4. Python-based PII masking libraries

I looked into libraries like `pii-anonymizer`. They identify PII via NER (Named Entity Recognition) algorithms, which has the upside of dynamic maintenance.

![]({{ site.baseurl }}/assets/2025-06-07-automatically-masking-pii-in-bigquery/5.webp)

> [pii-anonymizer](https://pypi.org/project/pii-anonymizer/)

But running this kind of de-identification directly inside an Airflow DAG's Python code means a single data engineer holds the keys to the logic — that's not a great place to be from a corporate security strategy perspective. (Ideally only GCP administrators can change the logic.)

### Conclusion. Sensitive Data Protection

After all of that, I went with GCP Sensitive Data Protection. It's a managed service that automatically detects PII in text or images using NLP and OCR-based algorithms, and applies masking or encryption based on user-defined rules.

The killer feature: GCP publishes both official documentation and an open-source Terraform repo for invoking this service from BigQuery via a Remote Function. That lets you write something like the following to selectively mask only the PII portion and safely use the rest:

```sql
SELECT
    fns.dlp_freetext_mask(pii_column) AS pii_masked
FROM
    table
```

This approach has two big advantages:

- It enforces internal security policy at the system level, with permission management via IAM.
- It's more flexible than regex, and safer than the probabilistic output of an LLM.

For these reasons I judged this to be the most realistic and security-appropriate choice. I wrote up a detailed proposal in Confluence, shared it with the DevOps and security teams, and asked for a review. With that proposal as the starting point, my colleagues could quickly evaluate the design and we moved into adoption fast.

---

# 3. Hands-on Walkthrough

> "Let's go through the actual build of the BigQuery DLP Remote Function together."

![]({{ site.baseurl }}/assets/2025-06-07-automatically-masking-pii-in-bigquery/6.webp)

> Internal execution flow of the BigQuery DLP Remote Function

Below is the build guide based on my own experience. If you read the official material as a non-DevOps / non-backend engineer, it can feel pretty rough and unfriendly. I felt the same way, so I'll lay it out more gently here.

- 📝 Official GCP doc: [De-identify BigQuery data at query time](https://cloud.google.com/sensitive-data-protection/docs/deidentify-bq-tutorial?hl=ko)
- 🖥 Official repo: [bigquery-dlp-remote-function](https://github.com/GoogleCloudPlatform/bigquery-dlp-remote-function)

### 3.0. Dev environment

- **macOS (Apple Silicon)**
- **`terraform` CLI (v1.8.2)** — install via [this link](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli).
- **`gcloud` SDK CLI (v525.0.0)** — installation steps below.
- **A GCP project with billing history.** (Without it, some services have usage caps that will get in your way during development.)

### 3.1. Clone the `bigquery-dlp-remote-function` repo

First, clone GCP's open-source project locally:

```bash
git clone https://github.com/GoogleCloudPlatform/bigquery-dlp-remote-function.git
cd bigquery-dlp-remote-function/
```

This project is built on Terraform. In other words, it ships the entire environment for "calling Sensitive Data Protection from BigQuery as a Remote Function" as IaC (Infrastructure as Code), deployable in one shot.

> **💡 [Author's Note] What is Terraform?**
>
> Standing up an environment usually means manually creating a huge number of resources in the right dependency order — tedious, error-prone, and easy to mess up. Terraform lets you describe that whole resource layout as a "blueprint," and with a single command it'll "construct" your cloud environment from the blueprint. That's why we call it "IaC."

![]({{ site.baseurl }}/assets/2025-06-07-automatically-masking-pii-in-bigquery/7.webp)

### 3.2. Install and initialize the gcloud SDK CLI

Because each GCP service has to be called locally, you need to install the `gcloud` SDK CLI. On macOS, Homebrew makes this easy:

```bash
brew install --cask google-cloud-sdk
gcloud init
gcloud version
```

### 3.3. Understand what Terraform deploys for you

`main.tf` defines the deployment process. It's complex, but in summary, the following environment gets built.

#### (1) Preparation

- Create the required service accounts and permissions, plus the storage spaces for code and for build artifacts.

#### (2) Turn code into a runnable image

- Use Cloud Build to package the Remote Function code into a Docker image, and store the image in Artifact Registry.

#### (3) Deploy the function

- Deploy the Docker image to Cloud Run so the Remote Function becomes invocable as a web service.

#### (4) Define PII detection and de-identification rules

- Define how Sensitive Data Protection should "Inspect" data for PII and how to "De-identify" it — these are templates.

#### (5) Wire it up to BigQuery

- Create a Connection so BigQuery can invoke the Cloud Run-deployed Remote Function, and finally create the BigQuery function that calls it.

![]({{ site.baseurl }}/assets/2025-06-07-automatically-masking-pii-in-bigquery/8.webp)

> A diagram of the full deployment flow

> **💡 [Author's Note] What is Cloud Build?**
>
> It's a service that pulls in your source code, runs automated tests, and turns it into a runnable application (here, an image). If you've never touched Docker, this may feel abstract — but think of it as turning an "install manual" into a fully-packaged application bundle.

> **💡 [Author's Note] What is Artifact Registry?**
>
> The images produced by Cloud Build have to live somewhere so they can be executed later. Artifact Registry is where those build artifacts are stored and managed.

> **💡 [Author's Note] What is Cloud Run?**
>
> Heard of "serverless"? Cloud Run lets you run code without managing servers. It only runs when something actually invokes it, which is great for cost. When we later call the BigQuery DLP Remote Function, the call flows through Cloud Run and on to Sensitive Data Protection.

> **💡 [Author's Note] What is a BigQuery Connection?**
>
> BigQuery can't natively call external APIs. A BigQuery Connection plays the bridge role that lets BigQuery talk to Cloud Run.

### 3.4. Enable the required GCP service APIs

Terraform will deploy resources by hitting each service's API, so head to GCP and run the following in Cloud Shell:

```bash
gcloud services enable \
artifactregistry.googleapis.com \
bigquery.googleapis.com \
bigqueryconnection.googleapis.com \
cloudbuild.googleapis.com \
cloudkms.googleapis.com \
containerregistry.googleapis.com \
dlp.googleapis.com \
run.googleapis.com \
secretmanager.googleapis.com
```

> **💡 [Author's Note] Where is Cloud Shell?**
>
> [This doc](https://cloud.google.com/shell/docs/using-cloud-shell?hl=ko) walks you through it. Be sure to pick the same project you're building this environment in.

![]({{ site.baseurl }}/assets/2025-06-07-automatically-masking-pii-in-bigquery/9.webp)

### 3.5. Understand the Sensitive Data Protection lifecycle

Sensitive Data Protection works in two steps internally — "Inspect" and "De-identify."

![]({{ site.baseurl }}/assets/2025-06-07-automatically-masking-pii-in-bigquery/10.webp)

> Inspect & De-identify

- Step 1: Identify which parts of the text are PII. (Inspect)
- Step 2: Transform the identified parts according to a user-defined rule. (De-identify)

Open the Sensitive Data Protection console and you'll see that both Inspect and De-identify behavior are declared as templates. You *can* configure them manually in the UI, but from a development perspective it's much better to bake these templates into Terraform too. (Always express expected infrastructure state as code.)

![]({{ site.baseurl }}/assets/2025-06-07-automatically-masking-pii-in-bigquery/11.webp)

> The GCP Sensitive Data Protection console

If you look inside the Terraform project we cloned, you'll find `sample_dlp_deid_config.json` — that's the De-identify template config. It's pretty bare, though, since it's just a sample. And `sample_dlp_inspect_config.json` doesn't exist at all. So the additional work is:

- Improve `sample_dlp_deid_config.json`.
- Add `sample_dlp_inspect_config.json`.

### 3.6. Updating the De-identify template config

Replace `sample_dlp_deid_config.json` with the JSON below.

- I picked all the relevant entries from the "personal information" category, referencing the [infoType Detector Reference](https://cloud.google.com/sensitive-data-protection/docs/infotypes-reference?hl=ko).
- I declared an asterisk (`*`) masking rule using the [De-identify template JSON schema doc](https://cloud.google.com/sensitive-data-protection/docs/reference/rest/v2/projects.deidentifyTemplates).

```json
{
  "deidentifyTemplate" : {
    "displayName" : "Global and Korea specific infoTypes Masker",
    "description":"De-identifies Global and Korea-specific infoTypes with Masking.",
    "deidentifyConfig": {
      "infoTypeTransformations": {
        "transformations": [
          {
            "infoTypes": [{"name": "ADVERTISING_ID"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "AGE"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "BLOOD_TYPE"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "CREDIT_CARD_DATA"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "CREDIT_CARD_EXPIRATION_DATE"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "CREDIT_CARD_NUMBER"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "CREDIT_CARD_TRACK_NUMBER"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "COUNTRY_DEMOGRAPHIC"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "CVV_NUMBER"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "DATE"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "DATE_OF_BIRTH"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "DEMOGRAPHIC_DATA"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "DOMAIN_NAME"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "DRIVERS_LICENSE_NUMBER"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "EMAIL_ADDRESS"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "EMPLOYMENT_STATUS"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "ETHNIC_GROUP"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "FINANCIAL_ACCOUNT_NUMBER"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "FINANCIAL_ID"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "FIRST_NAME"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "GENDER"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "GENERIC_ID"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "GEOGRAPHIC_DATA"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "GOVERNMENT_ID"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "IBAN_CODE"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "HTTP_COOKIE"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "HTTP_USER_AGENT"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "ICCID_NUMBER"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "ICD9_CODE"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "ICD10_CODE"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "IMEI_HARDWARE_ID"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "IMMIGRATION_STATUS"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "IMSI_ID"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "IP_ADDRESS"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "LAST_NAME"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "LOCATION"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "LOCATION_COORDINATES"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "MAC_ADDRESS"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "MAC_ADDRESS_LOCAL"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "MAC_ADDRESS_UNIVERSAL"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "MARITAL_STATUS"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "MEDICAL_DATA"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "MEDICAL_ID"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "MEDICAL_RECORD_NUMBER"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "MEDICAL_TERM"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "ORGANIZATION_NAME"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "PASSPORT"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "PERSON_NAME"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "PHONE_NUMBER"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "POLITICAL_TERM"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "RELIGIOUS_TERM"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "SEXUAL_ORIENTATION"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "STREET_ADDRESS"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "SWIFT_CODE"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "TECHNICAL_ID"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "TIME"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "TRADE_UNION"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "URL"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "VAT_NUMBER"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "VEHICLE_IDENTIFICATION_NUMBER"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "KOREA_ARN"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "KOREA_DRIVERS_LICENSE_NUMBER"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "KOREA_PASSPORT"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          },
          {
            "infoTypes": [{"name": "KOREA_RRN"}],
            "primitiveTransformation": {"characterMaskConfig": {"maskingCharacter": "*"}}
          }
        ]
      }
    }
  }
}
```

### 3.7. Adding the Inspect template config

Create a new file, `sample_dlp_inspect_config.json`, with the contents below.

- The infoTypes were chosen from the [infoType Detector Reference](https://cloud.google.com/sensitive-data-protection/docs/infotypes-reference?hl=ko).
- The structure follows the [InspectConfig JSON schema](https://cloud.google.com/sensitive-data-protection/docs/reference/rest/v2/InspectConfig).
- The infoType list must mirror the De-identify template exactly.

> **💡 [Author's Note] `minLikelihood`**
>
> I recommend `minLikelihood: "UNLIKELY"`. This is the detection threshold for PII identification. From unit testing I observed:
> - Lower than "UNLIKELY" → too eager, masks non-PII content and hurts usability.
> - Higher than "UNLIKELY" → too lax, lets some PII through and violates the policy.

```json
{
  "inspectTemplate": {
    "displayName" : "Global and Korea specific infoTypes Inspector",
    "description":"Inspects Global and Korea-specific infoTypes.",
    "inspectConfig": {
      "infoTypes": [
        {"name": "ADVERTISING_ID"},
        {"name": "AGE"},
        {"name": "BLOOD_TYPE"},
        {"name": "CREDIT_CARD_DATA"},
        {"name": "CREDIT_CARD_EXPIRATION_DATE"},
        {"name": "CREDIT_CARD_NUMBER"},
        {"name": "CREDIT_CARD_TRACK_NUMBER"},
        {"name": "COUNTRY_DEMOGRAPHIC"},
        {"name": "CVV_NUMBER"},
        {"name": "DATE"},
        {"name": "DATE_OF_BIRTH"},
        {"name": "DEMOGRAPHIC_DATA"},
        {"name": "DOMAIN_NAME"},
        {"name": "DRIVERS_LICENSE_NUMBER"},
        {"name": "EMAIL_ADDRESS"},
        {"name": "EMPLOYMENT_STATUS"},
        {"name": "ETHNIC_GROUP"},
        {"name": "FINANCIAL_ACCOUNT_NUMBER"},
        {"name": "FINANCIAL_ID"},
        {"name": "FIRST_NAME"},
        {"name": "GENDER"},
        {"name": "GENERIC_ID"},
        {"name": "GEOGRAPHIC_DATA"},
        {"name": "GOVERNMENT_ID"},
        {"name": "IBAN_CODE"},
        {"name": "HTTP_COOKIE"},
        {"name": "HTTP_USER_AGENT"},
        {"name": "ICCID_NUMBER"},
        {"name": "ICD9_CODE"},
        {"name": "ICD10_CODE"},
        {"name": "IMEI_HARDWARE_ID"},
        {"name": "IMMIGRATION_STATUS"},
        {"name": "IMSI_ID"},
        {"name": "IP_ADDRESS"},
        {"name": "LAST_NAME"},
        {"name": "LOCATION"},
        {"name": "LOCATION_COORDINATES"},
        {"name": "MAC_ADDRESS"},
        {"name": "MAC_ADDRESS_LOCAL"},
        {"name": "MAC_ADDRESS_UNIVERSAL"},
        {"name": "MARITAL_STATUS"},
        {"name": "MEDICAL_DATA"},
        {"name": "MEDICAL_ID"},
        {"name": "MEDICAL_RECORD_NUMBER"},
        {"name": "MEDICAL_TERM"},
        {"name": "ORGANIZATION_NAME"},
        {"name": "PASSPORT"},
        {"name": "PERSON_NAME"},
        {"name": "PHONE_NUMBER"},
        {"name": "POLITICAL_TERM"},
        {"name": "RELIGIOUS_TERM"},
        {"name": "SEXUAL_ORIENTATION"},
        {"name": "STREET_ADDRESS"},
        {"name": "SWIFT_CODE"},
        {"name": "TECHNICAL_ID"},
        {"name": "TIME"},
        {"name": "TRADE_UNION"},
        {"name": "URL"},
        {"name": "VAT_NUMBER"},
        {"name": "VEHICLE_IDENTIFICATION_NUMBER"},
        {"name": "KOREA_ARN"},
        {"name": "KOREA_DRIVERS_LICENSE_NUMBER"},
        {"name": "KOREA_PASSPORT"},
        {"name": "KOREA_RRN"}
      ],
      "minLikelihood": "UNLIKELY",
      "includeQuote": true,
      "excludeInfoTypes": false
    }
  }
}
```

### 3.8. Editing `main.tf`

The Terraform deployment manual needs a few changes:

- The original blueprint didn't create an Inspect template — we have to add that.
- Originally two BigQuery Remote Functions were declared (an Encrypt function and a Decrypt function). We only need a single Mask function, so simplify accordingly.
- GCS bucket names must be globally unique, so I made it more specific by including the project ID.

```hcl
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.0.0"
    }
  }
  provider_meta "google" {
    module_name = "cloud-solutions/deploy-bigquery-dlp-remote-function-v0.1"
  }
}

provider "google" {
  billing_project = var.project_id
  project         = var.project_id
  region          = var.region
}

resource "google_service_account" "run_service_account" {
  account_id = "${var.service_name}-runner"
  project    = var.project_id
}

resource "google_project_iam_member" "grant_role_to_sa" {
  for_each = toset([
    "roles/dlp.reader",
    "roles/dlp.user",
    "roles/dlp.admin",
  ])
  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.run_service_account.email}"
}

resource "google_artifact_registry_repository" "image_registry" {
  format        = "DOCKER"
  repository_id = var.artifact_registry_name
  project       = var.project_id
  location      = var.region
}

resource "google_service_account" "build_service_account" {
  account_id = "${var.service_name}-builder"
  project    = var.project_id
}

resource "google_project_iam_member" "grant_role_to_build_sa" {
  project = var.project_id
  role    = "roles/cloudbuild.builds.builder"
  member  = "serviceAccount:${google_service_account.build_service_account.email}"
}

resource "google_storage_bucket" "cloud_build_bucket" {
  project                     = var.project_id
  location                    = var.region
  name                        = "build_bucket_${var.service_name}_${var.project_id}"
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"
  force_destroy               = true
}

resource "google_storage_bucket_iam_member" "builder_iam_bucket" {
  for_each = toset([
    "roles/cloudbuild.builds.builder"
  ])
  bucket = google_storage_bucket.cloud_build_bucket.name
  member = "serviceAccount:${google_service_account.build_service_account.email}"
  role   = each.key
}

## Create Image using Cloud Build and store in artifact registry
resource "random_id" "build_version" {
  byte_length = 8

  keepers = {
    project_id = var.project_id
    region     = var.region
  }
}

resource "null_resource" "build_function_image" {
  depends_on = [
    google_artifact_registry_repository.image_registry,
    google_storage_bucket_iam_member.builder_iam_bucket
  ]

  triggers = {
    project_id      = var.project_id
    region          = var.region
    full_image_path = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.image_registry.name}/${var.service_name}:${random_id.build_version.hex}"
  }

  provisioner "local-exec" {
    when    = create
    command = <<EOF
gcloud builds submit \
--project ${var.project_id} \
--region ${var.region} \
--machine-type e2-highcpu-8 \
--substitutions _CONTAINER_IMAGE_NAME=${self.triggers.full_image_path} \
--service-account ${google_service_account.build_service_account.id} \
--default-buckets-behavior regional-user-owned-bucket \
--gcs-source-staging-dir gs://${google_storage_bucket.cloud_build_bucket.name}/source
EOF
  }

  provisioner "local-exec" {
    when    = destroy
    command = <<EOF
gcloud artifacts docker images delete \
${self.triggers.full_image_path} \
--quiet
EOF
  }
}

resource "google_cloud_run_v2_service" "bq_function" {
  location            = var.region
  name                = var.service_name
  project             = var.project_id
  depends_on          = [null_resource.build_function_image]
  deletion_protection = false

  template {
    service_account       = google_service_account.run_service_account.email
    execution_environment = "EXECUTION_ENVIRONMENT_GEN2"

    containers {
      image = null_resource.build_function_image.triggers.full_image_path
      env {
        name  = "PROJECT_ID"
        value = var.project_id
      }
    }
  }
}

resource "google_bigquery_connection" "external_bq_fn_connection" {
  project       = var.project_id
  connection_id = "ext-${var.service_name}"
  location      = var.region
  description   = "External transformation function connection"
  cloud_resource {}
}

resource "google_project_iam_binding" "grant_bq_connection_run_invoker_role" {
  project = var.project_id
  role    = "roles/run.invoker"
  depends_on = [
    google_bigquery_connection.external_bq_fn_connection
  ]
  members = [
    "serviceAccount:${google_bigquery_connection.external_bq_fn_connection.cloud_resource[0].service_account_id}"
  ]
}

resource "google_bigquery_dataset" "routines_dataset" {
  project    = var.project_id
  location   = var.region
  dataset_id = var.bq_dataset
}

## Create DLP De-identify Template

resource "random_id" "random_de_id_template_id_random" {
  byte_length = 8
  prefix      = "dlpdeidfn_"
  keepers = {
    project_id = var.project_id
    region     = var.region
  }
}

locals {
  de_id_template_id         = random_id.random_de_id_template_id_random.hex
  de_identify_template_json = merge(jsondecode(file(var.dlp_deid_template_json_file)), { templateId = local.de_id_template_id })
}

resource "null_resource" "dlp_de_identify_template" {
  triggers = {
    project_id                   = var.project_id
    region                       = var.region
    dlp_de_id_template_id        = local.de_id_template_id
    dlp_de_id_template_full_path = "projects/${var.project_id}/locations/${var.region}/deidentifyTemplates/${local.de_id_template_id}"
    template_file_hash           = filesha256(var.dlp_deid_template_json_file)
  }

  provisioner "local-exec" {
    when    = create
    command = <<EOF
curl -s https://dlp.googleapis.com/v2/projects/${self.triggers.project_id}/locations/${self.triggers.region}/deidentifyTemplates \
--header "X-Goog-User-Project: ${var.project_id}" \
--header "Authorization: Bearer $(gcloud auth print-access-token)" \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '${jsonencode(local.de_identify_template_json)}'
EOF
  }

  provisioner "local-exec" {
    when    = destroy
    command = <<EOF
curl -s --request DELETE \
https://dlp.googleapis.com/v2/${self.triggers.dlp_de_id_template_full_path} \
--header "X-Goog-User-Project: ${self.triggers.project_id}" \
--header "Authorization: Bearer $(gcloud auth print-access-token)" \
--header 'Accept: application/json' \
--header "Content-Type: application/json"
EOF
  }
}

## Create DLP Inspect Template

resource "random_id" "random_inspect_template_id_random" {
  byte_length = 8
  prefix      = "dlpinspectfn_"
  keepers = {
    project_id = var.project_id
    region     = var.region
  }
}

locals {
  inspect_template_id   = random_id.random_inspect_template_id_random.hex
  inspect_template_json = merge(jsondecode(file(var.dlp_inspect_template_json_file)), { templateId = local.inspect_template_id })
}

resource "null_resource" "dlp_inspect_template" {
  triggers = {
    project_id                     = var.project_id
    region                         = var.region
    dlp_inspect_template_id        = local.inspect_template_id
    dlp_inspect_template_full_path = "projects/${var.project_id}/locations/${var.region}/inspectTemplates/${local.inspect_template_id}"
    template_file_hash             = filesha256(var.dlp_inspect_template_json_file)
  }

  provisioner "local-exec" {
    when    = create
    command = <<EOF
curl -s https://dlp.googleapis.com/v2/projects/${self.triggers.project_id}/locations/${self.triggers.region}/inspectTemplates \
--header "X-Goog-User-Project: ${var.project_id}" \
--header "Authorization: Bearer $(gcloud auth print-access-token)" \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '${jsonencode(local.inspect_template_json)}'
EOF
  }

  provisioner "local-exec" {
    when    = destroy
    command = <<EOF
curl -s --request DELETE \
https://dlp.googleapis.com/v2/${self.triggers.dlp_inspect_template_full_path} \
--header "X-Goog-User-Project: ${self.triggers.project_id}" \
--header "Authorization: Bearer $(gcloud auth print-access-token)" \
--header 'Accept: application/json' \
--header "Content-Type: application/json"
EOF
  }
}

## Create BigQuery remote functions
resource "random_id" "bq_job_random" {
  byte_length = 8
}

resource "null_resource" "bq_dlp_mask_function" {
  depends_on = [null_resource.dlp_de_identify_template, null_resource.dlp_inspect_template, google_cloud_run_v2_service.bq_function, google_bigquery_connection.external_bq_fn_connection, google_bigquery_dataset.routines_dataset]

  triggers = {
    project_id         = var.project_id
    region             = var.region
    dataset_id         = var.bq_dataset
    cloud_service_name = google_cloud_run_v2_service.bq_function.id
    cloud_run_uri      = google_cloud_run_v2_service.bq_function.uri
  }

  provisioner "local-exec" {
    when    = create
    command = <<EOF
bq query --project_id "${self.triggers.project_id}" \
--use_legacy_sql=false \
"CREATE OR REPLACE FUNCTION ${self.triggers.dataset_id}.dlp_freetext_mask(v STRING) RETURNS STRING \
REMOTE WITH CONNECTION \`${self.triggers.project_id}.${self.triggers.region}.${google_bigquery_connection.external_bq_fn_connection.connection_id}\` \
OPTIONS (endpoint = '${self.triggers.cloud_run_uri}', user_defined_context = [('mode', 'deidentify'),('algo','dlp'),('dlp-deid-template','${null_resource.dlp_de_identify_template.triggers.dlp_de_id_template_full_path}'),('dlp-inspect-template','${null_resource.dlp_inspect_template.triggers.dlp_inspect_template_full_path}')]);" \
EOF
  }

  provisioner "local-exec" {
    when    = destroy
    command = <<EOF
bq query --project_id "${self.triggers.project_id}" \
--use_legacy_sql=false \
"DROP FUNCTION ${self.triggers.dataset_id}.dlp_freetext_mask" \
EOF
  }
}
```

### 3.9. Editing `variables.tf`

A few variables were updated and added:

- Variables that can be treated as constants (project ID, region, etc.) got default values.
- A new variable for the Inspect template config file path was added, so `main.tf` can reference it during Terraform runs.

```hcl
variable "project_id" {
  type    = string
  default = "joshua-private"
}

variable "region" {
  type    = string
  default = "asia-northeast3"
}

variable "artifact_registry_name" {
  type    = string
  default = "bq-remote-functions"
}

variable "bq_dataset" {
  type    = string
  default = "remote_functions"
}

variable "dlp_deid_template_json_file" {
  type    = string
  default = "sample_dlp_deid_config.json"
}

variable "dlp_inspect_template_json_file" {
  type    = string
  default = "sample_dlp_inspect_config.json"
}

variable "service_name" {
  default = "bq-transform-fns"
}

variable "user_os" {
  type        = string
  default     = "linux"
  description = "The OS of the person running the Terraform script. Options: [linux, darwin]"
  validation {
    condition     = contains(["linux", "darwin"], var.user_os)
    error_message = "Supported OS Options: [linux, darwin]"
  }
}
```

### 3.10. Authenticating the gcloud SDK

Terraform will deploy resources via the `gcloud` SDK, so authenticate first:

```bash
gcloud auth application-default login
```

![]({{ site.baseurl }}/assets/2025-06-07-automatically-masking-pii-in-bigquery/12.webp)

### 3.11. Previewing the project shape with `terraform plan`

Before applying, check what's about to get deployed:

```bash
terraform plan
```

![]({{ site.baseurl }}/assets/2025-06-07-automatically-masking-pii-in-bigquery/13.webp)

### 3.12. Deploying the GCP infra with `terraform apply`

Now deploy the GCP infrastructure for the PII masking function as IaC in a single shot:

```bash
terraform apply
```

> **💡 [Author's Note] I got an error!**
>
> If you see `ERROR: (gcloud.builds.submit) FAILED_PRECONDITION: due to quota restrictions, Cloud Build cannot run builds in this region`, you'll need GCP to allow Cloud Build in your region (in my case, `asia-northeast3`). Projects with little to no billing history sometimes have Cloud Build restricted for financial-stability reasons. Two options:
> - Quick workaround: set the Cloud Build deployment region to `us-central1`. (This only moves the *application image* to a US data center — PII data itself isn't moved, so privacy regulations aren't affected.)
> - Proper fix: file via [GCP Support Hub](https://cloud.google.com/support-hub?hl=en) or contact a Customer Engineer.

```bash
...
gcloud builds submit \
--project ${var.project_id} \
--region us-central1 \ # Override the region only here.
--machine-type e2-highcpu-8 \
--substitutions _CONTAINER_IMAGE_NAME=${self.triggers.full_image_path} \
--service-account ${google_service_account.build_service_account.id} \
--default-buckets-behavior regional-user-owned-bucket \
--gcs-source-staging-dir gs://${google_storage_bucket.cloud_build_bucket.name}/source
...
```

### 3.13. Running the function in the BigQuery console

After 5 – 10 minutes the infra should be fully set up, and you can check the masking function in action.

In the left Explorer panel, under the `remote_functions` dataset, you'll see the `dlp_freetext_mask` function in the Routines section.

Try the function on a sample PII record and you'll see the PII portion successfully masked.

![]({{ site.baseurl }}/assets/2025-06-07-automatically-masking-pii-in-bigquery/14.webp)

### 3.14. Cleaning up after the hands-on

To avoid ongoing charges, tear everything down once you're done:

```bash
terraform destroy
```

---

# 4. Deeper Notes

> "A few things to keep in mind."

### 4.1. Check the service cost

Take a look at Sensitive Data Protection pricing:

- [Sensitive Data Protection Pricing](https://cloud.google.com/sensitive-data-protection/pricing?hl=ko)

The BigQuery Remote Function reaches Sensitive Data Protection through a function on Cloud Run. As noted earlier, Cloud Run is serverless — you only pay when the code runs — which keeps the cost surprisingly low.

### 4.2. Check the service quotas and limits

Check the Sensitive Data Protection quotas and limits:

- [Sensitive Data Protection Quotas and Limits](https://cloud.google.com/sensitive-data-protection/pricing?hl=ko)

The service has fairly aggressive quota limits — if a real-time or batch pipeline tries to push too many records through it, you'll hit quota errors quickly. So you need to introduce pagination to throttle usage. In my Airflow DAG I avoided quota errors like this:

```python
...
PAGE_SIZE = 100 # Records per batch
TOTAL_ROWS = len(df) # Total record count
TOTAL_PAGES = (TOTAL_ROWS + PAGE_SIZE - 1) // PAGE_SIZE # Total pages

for PAGE in range(TOTAL_PAGES):
  OFFSET = PAGE * PAGE_SIZE

  query = f"""
    WITH
    CTE_batch AS (
      SELECT
        pii
      FROM
        table
      ORDER BY
        id
      LIMIT
        {PAGE_SIZE}
      OFFSET
        {OFFSET}
    )
    SELECT
      pii,
      remote_functions.dlp_freetext_mask(pii) as pii_masked
    FROM
      CTE_batch
  """

  result = client.query(query)
  result_df = result.to_dataframe()
  ...
```

### 4.3. How to read `dlp_freetext_mask` error logs

When `dlp_freetext_mask` fails in BigQuery, the BigQuery error message itself is not very informative — it'll only tell you that the `replies` field is missing:

```
Returned JSON from https://bq-transform-fns-xxx-du.a.run.app is not a valid object or it does not have "replies" field set. jobId: bquxjob_xxx, requestId: xxx.
```

In that case, head over to the Cloud Run console — the precise error logs live there. Keep this in mind for debugging.

![]({{ site.baseurl }}/assets/2025-06-07-automatically-masking-pii-in-bigquery/15.webp)

> Cloud Run

---

# 5. Closing Thoughts

> "Here is the value the BigQuery DLP Remote Function created."

So that's the detailed walkthrough of building a BigQuery function for automatic PII masking, using GCP Sensitive Data Protection. (I hope nothing was overly hard or under-explained.)

The BigQuery DLP Remote Function environment was, at its core, my attempt to resolve a dilemma: how do we keep up with internal security policy while still raising the organization's ability to use data? This was actually the first time the company had stood up an environment like this, so it took a lot of cross-team discussion — DevOps, security, data, and the leaders of each — and that made it a non-trivial undertaking.

Once it shipped, alongside the satisfaction of contributing to the organization, I personally walked away with a few things:

- A much broader understanding of cloud infrastructure. (I think I could spin up a Remote Function that calls Gemini straight from BigQuery pretty easily now.)
- A real jump in Terraform fluency. (I'd only used it for personal learning before, but applying it to a production problem made it stick.)
- A clearer sense of how to communicate with DevOps and security teammates while managing data pipelines. (DevOps cares deeply about `tfstate` management; security wants the PII logic itself declared explicitly.)

It was a hard project, but solving an unprecedented problem ended up letting the rest of the org use data at a higher level — and I grew a step in the process. The sense of accomplishment was unusually high. Whenever I face hard problems going forward, I want to remember this "sweet ending" and untangle them one by one. Thanks for reading.

---
