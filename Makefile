push:
	git add . && git commit -m "backup" && git push origin master

build:
	rm -rf public/ && hugo

server:
	rm -rf public/ && hugo server