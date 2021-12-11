.DEFAULT_GOAL := help

TAG=$(shell git log --pretty=format:%aI -1 | sed -e 's/[^0-9]*//g;s/.\{4\}$$//')-$(shell git log --pretty=format:%h -1)


.PHONY: test
test: 
	echo '$(TAG)' > version.txt

# docker-build: # Build the Docker image
# docker-publish: # Tag and publish docker image

.PHONY: help
help: # Display help
	echo 'HELP!!!'