import { useEffect, useMemo } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'

import { setLastProjectId } from '@/shared/lib/storage'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'

type TabValue = 'ideas' | 'playbook' | 'runs' | 'artifacts'

function getActiveTab(pathname: string): TabValue {
  // pathname like: /projects/:id/ideas
  const parts = pathname.split('/').filter(Boolean)
  const last = parts[parts.length - 1]
  if (last === 'playbook' || last === 'runs' || last === 'artifacts') return last
  return 'ideas'
}

export function ProjectLayout() {
  const { projectId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (projectId) setLastProjectId(projectId)
  }, [projectId])

  const activeTab = useMemo(() => getActiveTab(location.pathname), [location.pathname])

  function onTabChange(value: string) {
    if (!projectId) return
    const v = value as TabValue
    navigate(`/projects/${projectId}/${v}`)
  }

  function goBack() {
    navigate('/projects')
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Project</h1>
            <p className="text-sm text-muted-foreground">projectId: {projectId}</p>
          </div>

          <Button variant="outline" onClick={goBack}>
            Back to projects
          </Button>
        </div>

        <Card className="p-3">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ideas">Ideas</TabsTrigger>
              <TabsTrigger value="playbook">Playbook</TabsTrigger>
              <TabsTrigger value="runs">Runs</TabsTrigger>
              <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        <Outlet />
      </div>
    </div>
  )
}
