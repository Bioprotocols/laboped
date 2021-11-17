# Instructions for running the PAML Editor in Development
- Install [node.js](https://nodejs.org/en/download/)
- Clone this repository (`/` is the root of the cloned repository, below)
- Set the secret key in `/pamled/.env`:
```
# in /
python -c "import secrets; print(f'SECRET_KEY=\"{secrets.token_urlsafe()}\"')"  > pamled/.env
```
- Create a python environment:
```
virutalenv env
source /env/bin/activate
pip install https://github.com/Bioprotocols/paml # or, install locally for dev
```
- Install the client dependencies
```
# in /pamled/pamled_editor/client
npm install
```
- Generate the client Vue templates and copy into the Django server static files
```
cd /pamled/pamled_editor/client
npm run build -- --mode staging
```
- Optionally run the front end Vue server with the Vue CLI
```
# in /pamled/pamled_editor/client
npm run serve
```
- Run the Django server
```
# in /pamled
pip install django
python manage.py makemigrations # If you modify any of the django models
python manage.py migrate # setup the database
python manage.py runserver
```