.PHONY: new
new:
	sed "s/%date%/`date '+%Y-%m-%d %T %z'`/g; s/%title%/$(slug)/g" _templates/new_post.markdown > _posts/`date +%Y-%m-%d`-$(slug).markdown
