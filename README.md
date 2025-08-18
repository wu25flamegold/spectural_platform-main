# Spectral Platform

##### Full-stack project build by `React UI` and `Flask API Server`. 

##### Python dependencies are managed using `pip` and JavaScript dependencies are managed using `yarn`.

#### Envornment
- Node.js: 16.20.2
- Yarn: 1.22.22
- Pip: 24.3.1
- PostgreSQL: 17
- DB Port: 5432


## Prerequisites

> **Step 0: Pre-installation** 

```bash
$ # Install yarn
$ npm install -g yarn
$ 
$ # Install virtual environment
$ pip install virtualenv
$
$ # Run this if there's error during install virtualenv by powershell(Possible Issue: Windows PowerShell's Execution Policy may block the execution of virtual environment)
$ Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
$
```


## ✨ How to build

> **Step 1: Start the Flask API** 

```bash
$ cd api-server-flask
$ 
$ # Create a virtual environment
$ virtualenv env
$ .\env\Scripts\activate
$
$ # Install modules
$ pip install -r requirements.txt
$
$ # Set Up the Environment
$ export FLASK_APP=run.py
$ export FLASK_ENV=development
$ 
$ # Start the API
$ flask run 
```

<br />

> **Step 2: Compile & start the React UI**

```bash
$ cd react-ui
$
$ # Install Modules
$ yarn
$
$ set NODE_OPTIONS=--openssl-legacy-provider
$
$ # Start for development (LIVE Reload)
$ yarn start 
```

<br />

### Configuration (Optional)

> Change the port exposed by the Flask API

```bash
$ flask run --port 5001
```

Now, the API can be accessed on port `5001`

<br />

> Update the API port used by the React Frontend

**API Server URL** - `src/config/constant.js` 

```javascript
const config = {
    ...
    API_SERVER: 'http://localhost:5000/api/'
};
```
