# Race condition in async UI

## What happens

user types "a" then "ab", two requests are in flight, the slow old one answers last and overwrites the newer result

## How I reproduced it

NaiveSearch in src/exercises/race-condition-exercises.tsx, the test controls the order in which the fake fetch answers, it fails proves the bug

## Why it happens

Responses can arrive in a different order than requests were sent. The naive Effect has no cleanup, so every response calls setResults 

## The fix

AbortController created inside the Effect, signal passed to fetch, controller.abort() in the cleanup, AbortError ignored in catch

## Limits

Abort only cancels the browser request, the server may still do the work