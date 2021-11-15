from django.db import models

# Create your models here.

class Protocol(models.Model):
    name = models.CharField(max_length=100, primary_key=True)
    rdf_file = models.FileField(upload_to='protocols/') 

