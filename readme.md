<h2 align="center">
    clipfs
</h2>

<p align="center">
    <b>A clipboard module for interacting with the file system.</b>
</p>

<p align="center">
  <a href="https://www.typescriptlang.org/"><img src="https://badgen.net/badge/icon/typescript?icon=typescript&label" /></a>&nbsp;<a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square" /></a>
</p>

<h3 align="center">
    install
</h3>

<b>install as a cli</b>

```bash
$ npm i -g clipfs
```

<h3 align="center">
    usage
</h3>

<b>show clipboard content (available in combination with any command)</b>

```bash
$ clipfs -s
```

<b>copy file to clipboard</b>

```bash
$ clipfs ~/some.txt
```

<b>write clipboard to file</b>

```bash
$ clipfs -o ~/clipboard.txt
```

<b>copy file to clipboard then write clipboard to file</b>

```bash
$ clipfs ~/some.txt -o ~/clipboard.txt
```

<b>pipe text into clipboard</b>

```bash
$ cat ~/some.txt | clipfs
```

<b>pipe text into clipboard then write clipboard to file</b>

```bash
$ cat ~/some.txt | clipfs -o ~/clipboard.txt
```

<b>help</b>

```bash
$ clipfs -h 
$ clipfs --help
```

<h3 align="center">
    Configuration
</h3>

```bash
# log levels: trace, debug, info, message, error, silent
# default: message
CLIPFS_LOG_LEVEL=

# use colors in logs: true or false
# default: false
CLIPFS_LOG_COLORS=
```