# Incident Notifier REST API

This example demonstrates how to setup a [RESTful Web Services](https://en.wikipedia.org/wiki/Representational_state_transfer#Applied_to_web_services) allowing you to receive Opsgenie (or another provider) webhooks from alerts (and incidentes) and post it on Slack in a Custom way. DynamoDB is used to store the data. 

## Structure

This service has a separate directory for all the webhook operations. For each operation exactly one file exists e.g. `controllers/HookController.ts`. In each of these files there is exactly one context defined.

The idea behind the `controllers` directory is that in case you want to create a service containing multiple resources e.g. other incident actions and etc you could do so in the same service. While this is certainly possible you might consider creating a separate controller for each resource. It depends on the use-case and your preference.


## Setup

```bash
yarn tsc
```

## Deploy

In order to deploy the endpoint simply run

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service sls-typescript-incident-notifier.zip file to S3 (1.37 MB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
..............
Serverless: Stack update finished...
Service Information
service: sls-typescript-incident-notifier
stage: dev
region: us-east-1
stack: sls-typescript-incident-notifier-dev
resources: 13
api keys:
  None
endpoints:
  ANY - https://xxxxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev
  ANY - https://xxxxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
functions:
  http: sls-typescript-incident-notifier-dev-http
layers:
  None
Serverless: Removing old service artifacts from S3...

```

## Usage

You can post a webhook with the following command:

### Create a Hook

```bash
curl --location --request POST 'https://xxxxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/incident' \
--header 'Content-Type: application/json' \
--data-raw '{
    "action": "Create",
    "alert": {
        "alertId": "73919cd8-2a85-4401-abc7-cedf49ed24c2",
        "message": "Lorem Ipsum - Dollor Sit Amet - user@email.com",
        "tags": ["squad:xpto", "product:otpx"],
        "tinyId": "999999",
        "entity": "",
        "alias": "ef8cb5b9-9511-48ec-953e-5b7bee55a913_67d3ca58-204c-4606-9d2e-89a9bdb3caa6",
        "createdAt": 1625239292510,
        "updatedAt": 1625239293064000000,
        "username": "System",
        "description": "Gateway DB is running out of memory.",
        "team": "xpto",
        "responders": [
            {
                "id": "96aac541-97da-4953-8665-ecbf5dc3b4ed",
                "type": "team",
                "name": "xpto"
            }
        ],
        "teams": [
            "96aac541-97da-4953-8665-ecbf5dcabhj4ed"
        ],
        "actions": [],
        "details": {
            "impacted-services": "496c-8f6f-4868e06d3080",
            "incident-alert-type": "Owner",
            "incident-id": "8ec-953e-5b7bee55a916"
        },
        "priority": "P1",
        "source": ""
    },
    "source": {
        "name": "",
        "type": "incident"
    },
    "integrationName": "Webhook",
    "integrationId": "4c4e-9ccc-f85e705ef323",
    "integrationType": "Webhook"
}'
```

No output