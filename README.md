This is the working repo for the Match Keeper backend project.

Make sure to run `npm install` before you start working on your local copy.

To set up, first create a file called `.env` in the root of this directory. This file is a common practice for storing secrets, in this case our MongoDB authentication information.

Each line in the file represents an environment variable that will be set at runtime. The format is `VARIABLE_NAME=VALUE`. The following variables are required:

```
MONGO_URL="mongo://whatever/"
```

There are also optional variables, with the following defaults:

```
SERVER_HOST=localhost
SERVER_PORT=8080
```

This project is configured to run in production mode (`npm start`) and dev mode (`npm run dev`).