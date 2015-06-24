import ckan.plugins as plugins
	
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
    plugins.implements(plugins.ITemplateHelpers)

    MAPSTORE_FORMATS = ['wms', 'wmts', 'mapstore', 'map']

    def update_config(self, config):
                
        ''' Set up the resource library, public directory and
     	   template directory for the preview
        '''
	plugins.toolkit.add_public_directory(config, 'public')
        plugins.toolkit.add_template_directory(config, 'templates')
        plugins.toolkit.add_resource('preview', 'ckanext-mapstore')

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

    def get_helpers(self):

        from ckanext.mapstore import helpers as mapstore_helpers
        return {
                'get_wms_list': mapstore_helpers.get_wms_list,
		'get_mapstore_list': mapstore_helpers.get_mapstore_list,
		'get_map_list': mapstore_helpers.get_map_list
 	       }




