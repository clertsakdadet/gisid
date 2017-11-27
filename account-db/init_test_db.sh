#!/bin/bash

echo "******PostgreSQL initialisation test database******"

createdb acc_db_test -O gismin -U gismin

echo "******Initialisation finished******"