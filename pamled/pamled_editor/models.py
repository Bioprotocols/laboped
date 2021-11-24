from django.db import models
import sbol3

# Create your models here.

class Protocol(models.Model):
    name = models.CharField(max_length=100, primary_key=True)
    rdf_file = models.FileField(upload_to='protocols/')   

class Primitive(models.Model):
    name = models.CharField(max_length=100, primary_key=True)
    library = models.CharField(max_length=100)

    def get_inputs(self):
        return PrimitiveInput.objects.filter(primitive=self).distinct()
    
    def get_outputs(self):
        return PrimitiveOutput.objects.filter(primitive=self).distinct()
    

class Pin(models.Model):
    name = models.CharField(max_length=100, primary_key=True)
    type = models.CharField(max_length=100)
    units = models.CharField(max_length=100)


class PrimitiveInput(Pin):
    pass
    #input = models.ForeignKey(Parameter, related_name='input_parameter', on_delete=models.CASCADE)
    primitive = models.ForeignKey(Primitive, related_name='inputs', on_delete=models.CASCADE)

class PrimitiveOutput(Pin):
    pass
    # output = models.ForeignKey(Parameter, related_name='output_parameter', on_delete=models.CASCADE)
    primitive = models.ForeignKey(Primitive, related_name='outputs', on_delete=models.CASCADE)

class PAMLMapping():
    """
    This class maps paml library primitives to Django models so that they can be exposed to the API.
    The mapping from paml to models is incomplete so that the front end can include less data.
    """

    
        
    def reload_models(libraries = ['liquid_handling', 'plate_handling', 
                                   'spectrophotometry', 'sample_arrays']):
        import paml
        for lib in libraries:
            paml.import_library(lib)

        for l, lib_doc in paml.loaded_libraries.items():
            for p in lib_doc.objects:
                PAMLMapping._initialize_primitive(p, l)

    def _initialize_primitive(p, library):
        """
        Convert primtitive p to a model.
        """
        p_instance = Primitive(name=p.display_id, library=library)
        p_instance.save()
        
        inputs = [ PrimitiveInput(name=i.property_value.name, 
                                  type=i.property_value.type,
                                  primitive=p_instance) 
                   for i in p.get_inputs() ]
        
        outputs = [ PrimitiveOutput(name=i.property_value.name, 
                                    type=i.property_value.type,
                                    primitive=p_instance) 
                   for i in p.get_outputs() ]
        
        for param in inputs + outputs: 
            param.save()
        
