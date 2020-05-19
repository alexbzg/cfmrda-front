chown web_ftp:www-data src -R
chmod o+w src -R
chmod g+w public -R
rm /var/www/cfmrda/js/*
cp /var/www/cfmrda-dev/dist/js/* /var/www/cfmrda/js/
rm /var/www/cfmrda/css/*
cp /var/www/cfmrda-dev/dist/css/* /var/www/cfmrda/css/
cp /var/www/cfmrda-dev/dist/images/* /var/www/cfmrda/images -r
cp /var/www/cfmrda-dev/dist/html/* /var/www/cfmrda/html
cp /var/www/cfmrda-dev/dist/*.html /var/www/cfmrda/
cp /var/www/cfmrda-dev/dist/favicon.ico /var/www/cfmrda/
