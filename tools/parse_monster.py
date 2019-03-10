
import json

load_file = 'Monster.json'
save_file = 'monster_info.txt'

def main():
	with open(load_file, 'rb') as infile, open(save_file, 'w', encoding='utf-8') as outfile:
		monster_list = json.load(infile)
		monster_info_list = []
		for monster in monster_list:
			id = int(monster['ID'])
			name = monster['NAME']
			monster_info_list.append((id, name));

		monster_info_list.sort()
		for info in monster_info_list:
			line = '{0:3} {1}\n'.format(info[0], info[1])
			outfile.write(line)
			# print(line, end='')


if __name__ == '__main__':
	main()