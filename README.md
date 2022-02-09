# **Running the PAML Editor in Development**

## **Backend Instructions**
---

On your development system install:
- [pipenv](https://pipenv.pypa.io/en/latest/install/)

Initialize the pamled pipenv environment:
```bash
cd /path/to/pamled
pipenv install
pipenv shell
```

Initialize the backend
```bash
# from within the pipenv shell
cd /path/to/pamled/backend
python manage.py makemigrations accounts editor
python manage.py migrate

# optionally create a admin user
python manage.py createsuperuser
```

Start the backend
```bash
# from within the pipenv shell
cd /path/to/pamled/backend
python manage.py runserver
```

The backend server should now be running. You will see some output in the terminal like this:
```
Performing system checks...

System check identified no issues (0 silenced).
January 24, 2022 - 18:52:36
Django version 3.2.9, using settings 'pamled.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

## **Frontend Instructions**
---

On your development system install:
- [node & npm](https://nodejs.org/en/download/)

Initialize the frontend
```bash
cd /path/to/pamled/frontend/web
npm install
```

Start the frontend
```bash
cd /path/to/pamled/frontend/web
npm run start
```

If npm does not open a browser automatically then you can connect to the frontend at `http://localhost:3000` from your preferred browser.

Once connected you should be greeted by a login page. If you made a superuser account then you can login with that. Otherwise you can navigate to the sign up page and register a new account with your development database.

Once logged in you will see the editor and some initial set of primitives.

> NOTE:
>
> From the editor you may need to run the `Tools > Rebuild Primitives` command.
>
> At the time of writing this README that command is required to load in the non-default primitives. It will take a few moments to run and then the page should load the new primitives.

## **Development using Visual Studio Code**
---
For those familiar with VSCode the backand and frontend instructions have mostly been encapsulated within a VSCode workspace. See the `pamled.code-workspace` in the root of the repo.

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