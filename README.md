# product-manager
# Auth main concept:
- There is one owner user (created at DB initialisation) | perms: all + user_admin + super_admin + protected + owner
- IN PRODUCTION, using owner account for regular things is dangerous, it is a good idea to create a regular user with write rights and use that account for working
- There can be multiple user_admin | perms: custom + user_admin + protected 
- There can be multiple super_admin too, but only one SA is recommended | perms: super_admin + user_admin + protected 

- Every user_admin, super_admin and the owner is protected, so we can't modify or delete that accounts, but the owner account can do whatever it want...

- Owner can create, delete protected users(admins) but cant delete owner (because there is only one owner, we cant delete ourself)
- user_admin can create,delete user | perms: user_admin + insert:user, insert:product, delete:user, delete:product, 

- super_admin can create,delete,restore,remove users and products too | perms: super_admin + user_admin + insert:user, insert:product, delete:user, delete:product, restore:user, restore:product, remove:user, remove:product,

