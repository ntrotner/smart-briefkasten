# syntax=docker/dockerfile:1

FROM golang:1.22

RUN apt-get update -y
RUN apt-get upgrade -y

# Set destination for COPY
WORKDIR /app

# Download Go modules
COPY ./src/backend/go.mod ./src/backend/go.sum ./
RUN go mod download

# Copy the source code. Note the slash at the end, as explained in
# https://docs.docker.com/engine/reference/builder/#copy
COPY ./src/backend/ /app

# Build
RUN CGO_ENABLED=0 go build -o /app/output main.go
RUN chmod +x /app/output

# Optional:
# To bind to a TCP port, runtime parameters must be supplied to the docker command.
# But we can document in the Dockerfile what ports
# the application is going to listen on by default.
# https://docs.docker.com/engine/reference/builder/#expose
EXPOSE 8080

RUN if [ "$app_env" = "dev" ] ; then echo; else apt-get install -y inotify-tools psmisc ; fi

# Run
CMD if [ "$app_env" = "dev" ] ; then /app/go-reload.sh main.go ; else [ -f /tmp/filename.pid ] || (CGO_ENABLED=0 go build -o /app/output main.go && chmod +x /app/output) && /app/output ; fi
