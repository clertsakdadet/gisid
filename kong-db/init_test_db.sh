#!/bin/bash

echo "******PostgreSQL initialisation konga admin dashboard database******"

createdb konga -O kongmin -U kongmin

echo "******Initialisation finished******"