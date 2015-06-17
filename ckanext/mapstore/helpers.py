import logging
from pylons import config

from ckan import plugins as p
from ckan.lib import helpers as h

from  ckan.lib.helpers import json

log = logging.getLogger(__name__)

def get_wms_list(package):
	list_ = package['resources']
	package_id = package['id']
	
        ##package_name = package['name'] 
        package_name = package['title'] or package['name']
        
        package_extras = package['extras']
        time_interval = ''

        for item in package_extras:
		key = item.get('key')
		if key == 'temporal-extent-instant':
			value = item.get('value')
			value_array = value.split(',')
			time_interval = value_array[0] + '/' + value_array[len(value_array) - 1]
			break			
 
        layers_list = [] 

        for item in list_:
                format = item.get('format')
                if format == 'wms' or format == 'wmts':
                        resource = {
				'package_id': package_id,
                                'id':     item.get('id'),
                                'url':    item.get('url'),
                                'name':   item.get('name'),
				'pname':  package_name,
				'verified': item.get('verified'),
                                'time_interval': time_interval,
                                'format': format
                        }

         		##log.info('::::::::::::::::::::::::::: %r', package)

                        layers_list.append(resource)
                        
	
	if len(layers_list) > 0:
		return json.dumps(layers_list)


def get_mapstore_list(package):
        list_ = package['resources']
        package_id = package['id']

        maps_list = []

        for item in list_:
                format = item.get('format')
                if format == 'mapstore':
                        resource = {
				'package_id': package_id,
                                'id':     item.get('id'),
                                'url':    item.get('url'),
                                'name':   item.get('name'),
                                'format': format
                        }

                        maps_list.append(resource)

        if len(maps_list) > 0:
                return json.dumps(maps_list)

