from setuptools import setup, find_packages
import sys, os

version = '1.0'

setup(
	name='ckanext-mapstore',
	version=version,
	description="CKAN extension for MapStore",
	long_description="""\
	""",
	classifiers=[], # Get strings from http://pypi.python.org/pypi?%3Aaction=list_classifiers
	keywords='',
	author='Tobia Di Pisa',
	author_email='tobia.dipisa@geo-solutions.it',
	url='',
	license='',
	packages=find_packages(exclude=['ez_setup', 'examples', 'tests']),
	namespace_packages=['ckanext', 'ckanext.mapstore'],
	include_package_data=True,
	zip_safe=False,
	install_requires=[
		# -*- Extra requirements: -*-
	],
	entry_points=\
	"""
        [ckan.plugins]
	# Add plugins here, eg
	# myplugin=ckanext.mapstore:PluginClass
	mapstore_preview=ckanext.mapstore.plugin:MapStorePlugin
        geostore_harvester=ckanext.mapstore.harvesters:GeoStoreHarvester
	""",
)
