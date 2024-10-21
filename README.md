This is the working repo for the Match Keeper backend project.

To set up, first create a file called `.env` in the root of this directory. This file is a common practice for storing secrets, in this case our MongoDB authentication information.

Each line in the file represents an environment variable that will be set at runtime. The format is `VARIABLE_NAME=VALUE`. The following variables are used:

```
MONGO_URL=mongo://whatever/
```