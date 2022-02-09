allow(user: accounts::User, _action, _resource) if
    user.is_staff;

allow(user: accounts::User, "GET", resource) if
    user_owns_protocol(user, resource);

allow(user: accounts::User, "DELETE", resource) if
    user_owns_protocol(user, resource);

user_owns_protocol(user: accounts::User, resource: editor::Protocol) if
    resource in editor::Protocol.objects.filter(owner: user);
