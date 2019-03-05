

import plistlib
import xml.etree.ElementTree as et
import json
import pathlib

target_config_file = 'walk.xml'
uuid_config_file = '../../library/uuid-to-mtime.json'
save_file = 'animations.json'

def basename_no_ext(x):
	index = x.rfind('.')
	if index == -1:
		return x
	else:
		return x[0:index]

def read_framename_to_filename(filename):
	with open(filename, 'rb') as fp:
		result = plistlib.load(fp)
		frames = result['frames']
		ret = {}
		for key in frames.keys():
			key = basename_no_ext(key)
			ret[key] = filename
		return ret

def main():
	filename_to_uuid = {}
	with open(uuid_config_file) as fp:
		uuid_dict = json.load(fp)
		for uuid in uuid_dict:
			path = pathlib.Path(uuid_dict[uuid]['relativePath'])
			if path.suffix == '.plist':
				filename = basename_no_ext(path.name)
				filename_to_uuid[filename] = uuid

	tree = et.parse(target_config_file)
	plists_element = tree.find('plists')
	animations_element = tree.find('animations')

	framename_to_filename = {}
	for plist in plists_element:
		filename = plist.text.strip()
		tmp = read_framename_to_filename(filename)
		framename_to_filename.update(tmp)

	animation_dict = {}
	for animation in animations_element:
		name = animation.find('name').text
		delay = float(animation.find('delay').text)
		frames = []
		for element in animation:
			if element.tag == 'spriteFrame':
				frames.append(basename_no_ext(element.text))
		plist = framename_to_filename[frames[0]]
		plist = basename_no_ext(plist)

		animation_dict[name] = {
			'delay': delay,
			'plist': plist,
			'frames': frames,
			'uuid': filename_to_uuid[plist],
		}

	with open(save_file, 'w') as fp:
		json.dump(animation_dict, fp)

	print('Totoal animations:', len(animation_dict))

if __name__ == '__main__':
    main()
    input()