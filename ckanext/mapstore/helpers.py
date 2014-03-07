import logging
from pylons import config

from ckan import plugins as p
from ckan.lib import helpers as h

from  ckan.lib.helpers import json

log = logging.getLogger(__name__)

def get_wms_list(package):
	list_ = package['resources']
	package_id = package['id']

        layers_list = [] 

        for item in list_:
                format = item.get('format')
                if format == 'wms':
                        resource = {
				'package_id': package_id,
                                'id':     item.get('id'),
                                'url':    item.get('url'),
                                'name':   item.get('name'),
				'verified': item.get('verified'),
                                'format': format
                        }

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

