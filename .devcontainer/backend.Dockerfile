FROM alpine/git:latest AS builder
WORKDIR /clone-workspace
RUN git clone https://github.com/guites/gchan-backend.git

FROM node:14-slim
WORKDIR /workspace
COPY --from=builder /clone-workspace/gchan-backend .
# installs necessary packages for bcrypt (build-essential, python)
RUN apt-get update \
&& apt-get install -y build-essential \ 
&& apt-get install -y python
# remove locked dependencies to avoid build problems
RUN rm -rf package-lock.json \
&& rm -rf node_modules
# build the node app
RUN npm install