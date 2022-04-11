#!/usr/bin/env bash

# https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail
set -euxo pipefail

cd js/packages/spectral-validation-extension
npm publish