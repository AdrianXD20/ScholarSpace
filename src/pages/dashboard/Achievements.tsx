import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Plus, Award, Star, Briefcase, Trash2, Trophy } from 'lucide-react'
import { iconLogros } from '../../assets/Icons'
import Card, { CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/common/Modal'
import { useAuth } from '../../hooks/useAuth'
import { userService } from '../../services/user.service'
import type { Achievement } from '../../types/achievement.types'
import { formatDate, cn } from '../../utils/helpers'

const categoryOptions = [
  { value: 'academic', label: 'Academico', icon: Award, color: 'text-primary', bg: 'bg-primary/10' },
  { value: 'extracurricular', label: 'Extracurricular', icon: Star, color: 'text-accent', bg: 'bg-accent/10' },
  { value: 'personal', label: 'Personal', icon: Trophy, color: 'text-green-400', bg: 'bg-green-400/10' },
  { value: 'professional', label: 'Profesional', icon: Briefcase, color: 'text-orange-400', bg: 'bg-orange-400/10' },
] as const

export default function Achievements() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: 'academic' as Achievement['category'],
  })

  useEffect(() => {
    if (user?.id) {
      loadAchievements()
    }
  }, [user?.id])

  const loadAchievements = () => {
    if (user?.id) {
      setAchievements(userService.getAchievements(user.id))
    }
  }

  const filteredAchievements = selectedCategory
    ? achievements.filter((a) => a.category === selectedCategory)
    : achievements

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!user?.id || !formData.title.trim()) return

    userService.createAchievement(
      {
        title: formData.title,
        description: formData.description,
        date: formData.date || new Date().toISOString(),
        category: formData.category,
      },
      user.id
    )

    loadAchievements()
    setIsModalOpen(false)
    setFormData({ title: '', description: '', date: '', category: 'academic' })
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estas seguro de eliminar este logro?')) {
      userService.deleteAchievement(id)
      loadAchievements()
    }
  }

  const getCategoryInfo = (category: Achievement['category']) => {
    return categoryOptions.find((c) => c.value === category) || categoryOptions[0]
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            Todos
          </Button>
          {categoryOptions.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Agregar Logro
        </Button>
      </div>

      {/* Achievements Grid */}
      {filteredAchievements.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => {
            const categoryInfo = getCategoryInfo(achievement.category)
            const IconComponent = categoryInfo.icon

            return (
              <Card key={achievement.id} variant="bordered" className="group hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', categoryInfo.bg)}>
                      <IconComponent className={cn('w-5 h-5', categoryInfo.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground line-clamp-1">{achievement.title}</h3>
                        <button
                          onClick={() => handleDelete(achievement.id)}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                          aria-label="Eliminar logro"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                      <span className={cn('inline-block mt-1 px-2 py-0.5 text-xs rounded-full', categoryInfo.bg, categoryInfo.color)}>
                        {categoryInfo.label}
                      </span>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{achievement.description}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{formatDate(achievement.date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card variant="bordered">
          <CardContent className="py-12 text-center">
            <img
              src={iconLogros}
              alt=""
              className="w-16 h-16 mx-auto mb-4 object-contain"
              aria-hidden
            />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {selectedCategory ? 'No hay logros en esta categoria' : 'Registra tus logros'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Documenta tus logros academicos, personales y profesionales
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Agregar primer logro
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar Logro">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Titulo del logro"
            placeholder="Ej: Primer lugar en concurso de ciencias"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Descripcion</label>
            <textarea
              placeholder="Describe tu logro..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={cn(
                'w-full px-4 py-2.5 rounded-lg bg-input border border-border',
                'text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                'resize-none min-h-[100px]'
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Categoria</label>
            <div className="grid grid-cols-2 gap-2">
              {categoryOptions.map((cat) => {
                const IconComponent = cat.icon
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-lg border transition-colors',
                      formData.category === cat.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-secondary'
                    )}
                  >
                    <IconComponent className={cn('w-4 h-4', cat.color)} />
                    <span className="text-sm text-foreground">{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <Input
            label="Fecha"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Agregar Logro
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
