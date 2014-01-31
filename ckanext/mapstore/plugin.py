import ckan.plugins as plugins
#import ckan.plugins.toolkit as toolkit


class MapStorePlugin(plugins.SingletonPlugin):

    """This extension previews MapStore based

       This extension implements two interfaces

         - ``IConfigurer`` allows to modify the configuration
         - ``IConfigurable`` get the configuration
         - ``IResourcePreview`` allows to add previews
    """
    plugins.implements(plugins.IConfigurer, inherit=True)
    plugins.implements(plugins.IConfigurable, inherit=True)
    plugins.implements(plugins.IResourcePreview, inherit=True)

    MAPSTORE_FORMATS = ['wms', 'mapstore']

    def update_config(self, config):
                
        ''' Set up the resource library, public directory and
     	   template directory for the preview
        '''
	plugins.toolkit.add_public_directory(config, 'theme/public')
        plugins.toolkit.add_template_directory(config, 'theme/templates')
        plugins.toolkit.add_resource('theme/public', 'ckanext-mapstore')

    def can_preview(self, data_dict):
        resource = data_dict['resource']
        format_lower = resource['format'].lower()
        
        if format_lower in self.MAPSTORE_FORMATS:
            return True
        return False

    def setup_template_variables(self, context, data_dict):
        assert self.can_preview(data_dict)

        resource = data_dict['resource']
        format_lower = resource['format'].lower()

    def preview_template(self, context, data_dict):
        return 'mapstore.html'







