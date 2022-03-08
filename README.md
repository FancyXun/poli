# **Poli**

Poli is an easy-to-use SQL reporting application built for SQL lovers!

## Requirements

```sh
npm
maven
```

## Quick Installation

### Linux/MacOS

Build
```sh
git clone git@github.com:FancyXun/poli.git
```
You must modify you own [encrypted_db server](https://github.com/FancyXun/EulerDB) address in [web-app/src/config.js](https://github.com/FancyXun/poli/blob/master/web-app/src/config.js)

```sh
cd poli
sh build.sh
```

Start
```sh
cd target
java -jar poli-0.12.2.jar
```

DataMeta.  
First create database named eulerdb_schema   
Then
```sh
mysql -u user -p password -h host -P port -Deulerdb_schema < db/schema-mysql.sql
```


Open http://localhost:6688/poli in chrome
## License

MIT License
