# COMMIT RULES

In the project, we use commitlint as a code submission process detection tool. `commitlint` checks if your commit messages meet the [conventional commit format.](https://conventionalcommits.org/).

In general the pattern mostly looks like this:

```
type(scope?): subject  #scope is optional; multiple scopes are supported (current delimiter options: "/", "\" and ",")
```

Common types can be: `build`, `chore`, `ci`, `docs`,`feat`, `fix`,`pref`, `refactor`,`revert`, `style` and `test`.

Real world examples can look like this:

```
  feat: add some new feature
```

```
  chore: small changes
```

```
  fix: fix the login issue
```


