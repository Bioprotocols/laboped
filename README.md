# **Introduction**

The LabOp Editor (LabOPEd) is a web application that supports the authoring and sharing of LabOp protocols.  LabOPEd consists of two components: `frontend` and `backend`.  The frontend is a React-based server for handling the graphical interface.   The backend is a Django REST server that handles persistent storage (protocols, user accounts, and primitives), and access to the pyLabOp library.

# **User Guide**

See the user guide at: [User Guide](frontend/web/src/USERGUIDE.md)

# **Running the LabOp Editor in Development**

## **Pre-requisites**
- Backend <a name="backend-deps"></a>
    - [Python 3.9](https://www.python.org/downloads/release/python-390/)
    - [Pipenv](https://pipenv.pypa.io/en/latest/install/)
- Frontend <a name="frontend-deps"></a>
    - [Node & Npm](https://nodejs.org/en/download/)


## **Backend Instructions**
---

1. On your development system install [backend dependencies](#backend-deps)

2. Get LabOPEd:
```bash
git clone https://github.com/Bioprotocols/laboped.git
```

3. Initialize the laboped pipenv environment:
```bash
cd laboped
pipenv install
pipenv shell
```

4. Set the secret key in `backend/.env`:
 ```bash
 python -c "import secrets; print(f'SECRET_KEY=\"{secrets.token_urlsafe()}\"')"  > backend/.env
 ```

5. Initialize the backend
```bash
# from within the pipenv shell
cd backend
python manage.py makemigrations accounts editor
python manage.py migrate

# optionally create a admin user
python manage.py createsuperuser
```

6. Start the backend
```bash
# from within the pipenv shell, in backend/
python manage.py runserver
```

The backend server should now be running. You will see some output in the terminal like this:
```
Performing system checks...

System check identified no issues (0 silenced).
January 24, 2022 - 18:52:36
Django version 3.2.9, using settings 'laboped.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

## **Frontend Instructions**
---

1. On your development system install:
- [node & npm](https://nodejs.org/en/download/)

2. Initialize the frontend
```bash
# while in backend/ from above
cd ../frontend/web
npm install
```

3. Start the frontend
```bash
# while in frontend/web/
npm run start
```

If npm does not open a browser automatically then you can connect to the frontend at `http://localhost:3000` from your preferred browser.

4. Once connected you should be greeted by a login page. If you made a superuser account then you can login with that. Otherwise you can navigate to the sign up page and register a new account with your development database.

5. Once logged in you will see the editor.


## **Development using Visual Studio Code**
---
For those familiar with VSCode the backand and frontend instructions have mostly been encapsulated within a VSCode workspace. See the `laboped.code-workspace` in the root of the repo.

**Note** that this workspace does still require `pipenv` and `npm` to be installed.

## **Tasks**

The workspace provides a set of tasks available via command palette (`Ctrl+Shift+P`) under `Tasks: Run Task`.

These make initialization of the backend and frontend a bit easier to manage.
> ### Tasks:
> - Make Migrations
> - Migrate
> - Create Superuser
> - Nuke DB & Migrations

## **Launchers**

It also provides a set of launch commands available from the `Run and Debug` panel (`Ctrl+Shift+D`).

These make it easier to launch all of the editor parts at once.
>### Launchers
>- Django
>- React
>- Firefox
>- Chrome
>### Compound Launchers
>- Django & React & Firefox
>- Django & React & Chrome

# Mac M1 install
- The oso dependency requires manually building oso, per instructions at: https://github.com/osohq/oso/issues/808.  The final install step `make python-build` must be executed in the virtual environment (e.g., `pipenv run make python-build`).