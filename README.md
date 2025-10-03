# delete old functions e.g.

```
drop function if exists public.is_staff_user() cascade;
```

# profiles table

```
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  first_name text,
  last_name text,
  institution text,
  email text,
  is_admin boolean default false,
  is_staff boolean default false,
  is_approved boolean default false,

  primary key (id)
);

alter table public.profiles enable row level security;

-- inserts a row into public.profiles
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name,institution,email)
  values (new.id, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name',new.raw_user_meta_data ->> 'institution',new.email);
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

```
```
CREATE POLICY "User ALL for own profile, staff ALL for all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_staff_user(auth.uid()) or auth.uid() = id)
WITH CHECK (public.is_staff_user(auth.uid()) or auth.uid() = id);
```


# checking user status

* https://dev.to/shahidkhans/setting-up-row-level-security-in-supabase-user-and-admin-2ac1

```
CREATE OR REPLACE FUNCTION public.is_staff_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_staff BOOLEAN;
BEGIN
  SELECT profiles.is_staff INTO is_staff
  FROM public.profiles
  WHERE profiles.id = user_id;
  RETURN is_staff;
END;
$$;
```

```
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT profiles.is_admin INTO is_admin
  FROM public.profiles
  WHERE profiles.id = user_id;
  RETURN is_admin;
END;
$$;
```



# Authentication

* Supabase > Authentication > SMTP Settings
```
noreply@portal.implantify.eu
Implantify Portal Admin
smtp.resend.com
465
resend
resend_api_key
```

* Supabase > Authentication > URL Configuration
```
Site URL
https://xenoa.vercel.app

Redirect URLs
http://localhost:5173/**
```

* Supabase > Authentication > Emails

- Reset Password

```
<p><img style="margin: 0; border: 0; padding: 0; display: block;" width="300" src="https://portal.implantify.eu/_app/immutable/assets/logo.2wviG-VA.png"/></p>

<h2>Reset Yor Password</h2>

<p>
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/private/account">Reset Password<a>
</p>

```
- Magic Link
```
<p><img style="margin: 0; border: 0; padding: 0; display: block;" width="300" src="https://portal.implantify.eu/_app/immutable/assets/logo.2wviG-VA.png"/></p>

<h2>Sign In Link</h2>

<!--<p><a href="{{ .SiteURL }}?token_hash={{ .TokenHash }}&type=email">Log In</a></p>-->
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/private">Log In</a></p>
```

- Confirm SignUp
```
<p><img style="margin: 0; border: 0; padding: 0; display: block;" width="300" src="https://portal.implantify.eu/_app/immutable/assets/logo.2wviG-VA.png"/></p>

<h2>Confirm your Sign Up</h2>

<p>
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/auth/landing">Confirm your email<a>
</p>
```




# log

```
create table public.log (
    id int primary key generated always as identity,
    table_name text not null default format(''::text),
    log text not null default format(''::text),
    user_id uuid not null,
    user_email text not null default format(''::text),
    created_at timestamp with time zone DEFAULT now()
 
  
);

alter table log enable row level security;

CREATE POLICY "Staff can view all log,customers only their own"
ON public.log
FOR SELECT
TO authenticated
USING (public.is_staff_user(auth.uid()) or auth.uid() = user_id);

CREATE POLICY "Users or staff can create an log"
ON public.log FOR INSERT
TO authenticated
WITH CHECK ( ((select auth.uid()) = user_id) or (public.is_staff_user(auth.uid())) ); 

CREATE POLICY "only admin can delete all"
ON public.log FOR DELETE
TO authenticated
USING (public.is_admin_user(auth.uid()))

```





Twillo Recovery Code, user agheadley@gmail.com
```
ZB1WJZYV1XESKJNS8KYSB99V
```