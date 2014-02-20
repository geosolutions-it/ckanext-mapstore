from __future__ import division
from  ckan.lib.helpers import json

import logging
import urllib2
import math
import uuid

from ckan import model
from ckan.model import Session, Package

from ckanext.harvest.model import HarvestObject
from ckanext.harvest.harvesters import HarvesterBase
from ckanext.harvest.model import HarvestObjectExtra as HOExtra

log = logging.getLogger(__name__)

class GeoStoreHarvester(HarvesterBase):

	def info(self):
		return {
			'name': 'GeoStore Harvester',
			'title': 'GeoStore Server Harvester',
			'description': 'GeoStore MapStore Resources Repository',
			'form_config_interface': 'Text'
		}

	def _api_to_source_page(self, api_endpoint):
		"""
		Return the resources web link in order to 
		show it in the dadaset page  
		"""
		return api_endpoint

    	def _get_content(self, url):
        	http_request = urllib2.Request(
            		url = url,
        	)

		http_request.add_header('Accept', 'application/json')

        	http_response = urllib2.urlopen(http_request)

        	return http_response.read()

	def _get_resources_count(self, url):
		http_request = urllib2.Request(
                        url = url,
                )

                http_response = urllib2.urlopen(http_request)

                return http_response.read()


	def gather_stage(self, harvest_job):
		log = logging.getLogger(__name__ + '.GeoStore.gather')
		log.info('GeoStoreHarvester gather_stage for job: %r', harvest_job)
     		
		try:
			url = harvest_job.source.url + 'resources/count/*'
			count = self._get_resources_count(url)

                	if not count:
                        	log.error('Resources count not received from GeoStore', harvest_job)
                        	return None
                except Exception,e:
                        self._save_gather_error('Error retrieving resources count from GeoStore', harvest_job)
                        return None

		log.debug('GeoStoreHarvester gather_stage resource count: %s' % count) 
		
		entries = 10
		num = int(count) / entries
		num_of_pages = math.ceil(num)
                 
		page = 0
		guid_in_harvest = []
		for c in range(0, int(num_of_pages)):
			page = c
			
			try:
				url = harvest_job.source.url + 'resources/?entries=%s' % entries + '&page=%s' % page
				content = self._get_content(url)

                        	if not content:
                                	log.error('Not all content received from GeoStore', harvest_job)
                                	return None
			except Exception,e:
                        	self._save_gather_error('Error retrieving the short resource list from GeoStore', harvest_job)
                        	return None
			
			log.debug('Resources List: %r', content)

			data = json.loads(content)

			resources = data["ResourceList"]["Resource"]
			
			for resource in resources:
				id = resource["id"]
				
				log.debug('->-> Gather Resource with id: %r', id)
				
				obj = HarvestObject(guid=id, job=harvest_job)
				#, extras=[HOExtra(key='status', value='new')])

				obj.save()

				guid_in_harvest.append(obj.id) 
		
		log.debug('Finish GeoStoreHarvester gather_stage for job: %r', harvest_job)

        	if len(guid_in_harvest) == 0:
            		self._save_gather_error('No records received from the GeoStore server', harvest_job)
            		return None		
		
		log.debug('NUMBER OF GEOSTORE RESOUCRES HARVESTED: %s', len(guid_in_harvest))
		
		return guid_in_harvest

	def fetch_stage(self, harvest_object):
		log = logging.getLogger(__name__ + '.GeoStore.fetch')
                log.debug('GeoStoreHarvester fetch_stage for object: %s', harvest_object.id)

		if not harvest_object:
			log.error('No harvest object received')
			return False

		identifier = harvest_object.guid
		
		try:
			url = harvest_object.source.url + 'resources/resource/%s' % identifier
        	        content = self._get_content(url)
                	
			if not content:
                        	log.error('Not all content received from GeoStore', harvest_object)
                        	return False
                except Exception,e:
	                log.error('Error retrieving the resources from GeoStore', harvest_object)
                        return False
                
		data = json.loads(content)

		try:
			# Save the fetch content in the HarvesterObject
                	resource = data["Resource"]

			harvest_object.content = json.dumps(resource)
			harvest_object.save()
		except Exception,e:
			self._save_object_error('Error saving the harvest object for GUID %s [%r]' % \
                                               (identifier, e), harvest_object)
                        return False
		

        	log.debug('GeoStore Resource content saved with GUID %s ', resource["id"])
        	return True		

     	def import_stage(self,harvest_object):
        	if not harvest_object:
            		log.error('No harvest object received')
            		return False
        
        	if harvest_object.content is None:
            		self._save_object_error('Empty content for object %s' % harvest_object.id,harvest_object,'Import')
            		return False
	
        	try:
			resource_content = json.loads(harvest_object.content)
			package_dict = {
				'title': resource_content['name'],
				'url': '',   # This represent the source Dataset
				'description': resource_content['description'],
				'notes': resource_content['description'],
				'author': '',
				'maintainer': '',
				'maintainer_email': '',
				'tags': ['mapstore', resource_content['name']],
				'license_id': '',
				'extras':{
					'creation': resource_content['creation']
				},
				'resources': []						
			}

            		package_dict['id'] = unicode(uuid.uuid4()) #harvest_object.guid

            		# Save reference to the package on the object
            		harvest_object.package_id = package_dict['id']
            		harvest_object.add()

                        # We need to get the owner organization (if any) from the harvest
                        # source dataset
                        #source_dataset = model.Package.get(harvest_object.source.id)
                        #if source_dataset.owner_org:
                        #        log.info('Dataset Organization is: %s' % source_dataset.owner_org)
                        #        package_dict['owner_org'] = source_dataset.owner_org

            		package_dict['name'] = self._gen_new_name(package_dict['title'])
		
			if 'Attributes' in resource_content:
				attribute = resource_content['Attributes']['attribute']
				name = attribute['name']
			
				if name == 'owner':
					value = attribute['value']

                                       	package_dict['author'] = value
					package_dict['maintainer'] = value

			if 'lastUpdate' in resource_content:
				package_dict['extras']['last_update'] = resource_content['lastUpdate']
			else:
				package_dict['extras']['last_update'] = ''

		        package_dict['resources'].append({
                    		'url': harvest_object.source.url + 'data/%s' % harvest_object.guid,
                    		'format': 'mapstore',
				'name': resource_content['name'],
                    		'description': resource_content['description']
                    	})
					
            		return self._create_or_update_package(package_dict, harvest_object)
        	except Exception, e:
            		log.exception(e)
            		self._save_object_error('%r' % e, harvest_object, 'Import')			
