
import json

monster_file = 'Monster.json'
event_file = 'Event.json'
save_file = 'monster_info.txt'

init_list = 
[
	(408, '脚踩机关')
]

def main():
	with open(monster_file, 'rb') as in_monster, \
		open(event_file, 'rb') as in_event, \
		open(save_file, 'w', encoding='utf-8') as outfile:

		monster_info_list = []
		id_set = set()
		def add_monster_info(id, name):
			if id in id_set:
				return
			id_set.add(id)
			monster_info_list.append((id, name))

		## parse Monster.json
		monster_list = json.load(in_monster)
		for monster in monster_list:
			id = int(monster['ID'])
			name = monster['NAME']
			add_monster_info(id, name)

		## parse Event.json
		event = json.load(in_event)
		for floor in event['FLOOR']:
			if 'GID' not in floor:
				continue

			GID = floor['GID']
			if not type(GID) is list:
				GID = [GID]
			for info in GID:
				id = int(info['ID'])
				name = info['NAME']
				add_monster_info(id, name)

		## sort result
		monster_info_list.sort()
		for info in monster_info_list:
			line = '{0:3} {1}\n'.format(info[0], info[1])
			outfile.write(line)
			# print(line, end='')


if __name__ == '__main__':
	main()