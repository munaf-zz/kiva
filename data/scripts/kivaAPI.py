import json
import urllib

API_URL = 'http://api.kivaws.org/v1/loans/search.json'

def getLoanPage(page):
	url = API_URL + '?page=' + str(page)
	results = urllib.urlopen(url)
	json_obj = json.load(results)
	return json.dumps(json_obj.get('loans'))

def cacheLoans(num_pages):
	results = urllib.urlopen(API_URL)
	totalPages = json.load(results).get('paging').get('pages')

	if num_pages > totalPages:
		num_pages = totalPages

	file_list = []

	for page in range(1, num_pages+1):
		print "Getting page %d" % page
		fname = 'page' + str(page) + '.dat'
		file_list.append(fname)
		output = []
		output.append(getLoanPage(page))
		FILE = open(fname, 'w')
		FILE.writelines(output)
		FILE.close()
	
	return file_list

def merge_dat2js(file_list, varname):
	output = []
	output.append('exports.' + varname + '=[')
	num_files = len(file_list)
	for index in range(0, num_files): 
		print "Merging file %d" % index
		FILE = open(file_list[index], 'r')
		output.append(FILE.read())
		if index < (num_files-1): 
			output.append(',')
		FILE.close()

	output.append('];')
	jsdata = open(varname + '.js', 'w')
	jsdata.writelines(output)
	jsdata.close()

num_pages = 5000; 
file_list = cacheLoans(num_pages)
merge_dat2js(file_list, 'LOANS_1000_RAW')
