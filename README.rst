===============================
Barbican UI
===============================

Barbican User Interface

* Free software: Apache license
* Source: http://opendev.org/openstack/barbican-ui
* Bugs: https://storyboard.openstack.org/#!/project/openstack/barbican-ui

Depends on
----------
* Keystone
* Barbican
* Horizon

Change logs
-----------
* The barbican-ui on the official is too old to adapt to the new version of Horizon, fork from https://github.com/kleberrangel/barbican-ui to adapt to the new version of Horizon
* Update ``Manual Installation`` of README.rst

Features
--------
* Manage Secrets
    * Create Secrets
    * List and Get Secrets
    * Update Secrets
    * Delete Secrets


Enabling in DevStack
--------------------

Add this repo as an external repository into your ``local.conf`` file::

    [[local|localrc]]
    # enable_plugin barbican_ui https://github.com/openstack/barbican-ui
    enable_plugin barbican_ui https://github.com/cucker0/barbican-ui

Manual Installation
-------------------
This section describes how to install and configure the barbican-ui for Rocky Linux 9.

* Horizon reference https://docs.openstack.org/horizon/latest/


1. Clone barbican-ui from git repository::

    #git clone https://github.com/openstack/barbican-ui
    git clone https://github.com/cucker0/barbican-ui

2. Install barbican-ui::

    cd barbican-ui
    pip3 install -r ./requirements.txt
    pip3 install .

3. Enable barbican-ui in your Horizon::

    # Root of Openstack Dashboard, use `whereis openstack-dashboard` to find out it
    HORIZON_SITE_ROOT=/usr/share/openstack-dashboard

    cp ./barbican_ui/enabled/* $HORIZON_SITE_ROOT/openstack_dashboard/local/enabled/

4. Run collectstatic command::

    python3 $HORIZON_SITE_ROOT/manage.py collectstatic -c

5. Compress static files::

    python3 $HORIZON_SITE_ROOT/manage.py compress

6. Restart your Horizon service::

    systemctl restart httpd.service

7. After restart your Horizon, reload dashboard forcely using [Ctrl + F5] or etc. in your browser
