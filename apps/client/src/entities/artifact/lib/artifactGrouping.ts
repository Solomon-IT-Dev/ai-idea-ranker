import type { Artifact, VersionsByType } from '@/entities/artifact/types/artifact'

export function groupArtifactsByType(artifacts: Artifact[]): VersionsByType {
  return artifacts.reduce(
    (acc, artifact) => {
      acc[artifact.type].push(artifact)
      return acc
    },
    { plan_30_60_90: [] as Artifact[], experiment_card: [] as Artifact[] }
  )
}
