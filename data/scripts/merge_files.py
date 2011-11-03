import json
import os
from glob import glob
import urllib

# Compresses Kiva JSON file by returning only the values we need.
def clean_json_file(filename):
	json_file = open(filename)
	json_data = json.load(json_file)
	loans = json_data.get('loans')
	loans_clean = [] 

	# save data we want to a new blank object
	index = 0 
	for loan in loans:
		index = index + 1
		newloan = {}
		newloan['id'] = loan['id']
		newloan['stat'] = loan['status']
		newloan['amt'] = loan['funded_amount']
		newloan['date'] = loan['posted_date']
		newloan['sect'] = loan['sector']
		newloan['pid'] = loan['partner_id']
		if 'country_code' in loan['location']:
			newloan['cc'] = loan['location']['country_code']
		else:
			newloan['cc'] = 'XX'
		newloan['loc'] = loan['location']['country']
		loans_clean.append(newloan)
	json_file.close()

	# write to a new file
	output = []
	output.append(json.dumps(loans_clean))
	outfile = open('clean-loans/' + os.path.basename(filename), 'w')
	outfile.writelines(output)
	outfile.close()

def clean_all_loans():
	path = 'loans/'
	for infile in glob(os.path.join(path, '*.json')):
		print "Working on %s" % infile
		clean_json_file(infile)
	print "Finished cleaning JSON files"

def merge_json_files(path, outfile):
	output = []
	output.append('exports.' + outfile + '=[')
	filelist = glob(os.path.join(path, '*.json'))
	numfiles = len(filelist)
	for index in range(0, numfiles):
		f = open(filelist[index])
		output.append(f.read())
		if index < (numfiles-1):
			output.append(',')
		f.close()
	output.append('];')
	FILE = open('_' + outfile + '.js', 'w')
	FILE.writelines(output)
	FILE.close()

def make_partner_obj():
	f = open('partner_ids.json')
	j = json.load(f)
	ids = j.get('ids')
	url = 'http://api.kivaws.org/v1/partners.json?'
	jf = json.load(urllib.urlopen(url))
	partners = jf.get('partners')
	paging = jf.get('paging')
	page = 1
	pages = int(paging.get('pages'))
	while page <= pages:
		print "Getting page %d" % page
		page = page + 1
		url = url + 'page=' + str(page)
		jf = json.load(urllib.urlopen(url))
		partners = partners + jf.get('partners')
	
	output = []
	for num in ids:
		for p in partners:
			if int(num) == int(p.get('id')):
				output.append(p.get('name'))

	ind = 1 
	while ind < len(output):
		output.pop(ind)
		ind = ind + 2
	print "%r" % (len(ids) == len(output)) 
	outfile = open('partner_names.js', 'w')
	outfile.writelines(json.dumps(output))
	outfile.close()

make_partner_obj()
# clean_all_loans()
# merge_json_files('clean-loans/', 'LOANS')
