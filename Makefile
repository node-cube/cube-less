install:
	@npm install .

publish: release
	@npm publish

test:
	@npm test

.PHONY: \
	install publish test
