#!/bin/bash
# install.sh

# Check for root privileges.
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root" 1>&2
    exit 1
fi

# Copy the service file to the systemd directory.
cp mongodb.service /etc/systemd/system/mongodb.service

# Reload systemd to recognize the new service.
systemctl daemon-reload

# Start the service.
systemctl start mongodb.service
