# Distribute the corpus with npx skills

Dawg Skills keeps every approved skill canonical under `.agents/skills/` and distributes the entire corpus with `npx skills`. Downstream repositories own a `skills-sync` Make target that installs the corpus and runs the distributed `dawg-routing` projection; native agent projections and lock state remain generated rather than duplicated in this source repository.
