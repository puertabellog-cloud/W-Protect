// Servicio del Foro - Historias de Esper// Interfaces de amistad removidas para simplificarofile } from '../api/client';

export interface Storia {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  category: 'superacion' | 'violencia' | 'trabajo' | 'familia' | 'salud' | 'educacion' | 'otro';
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  commentsCount: number;
  isAnonymous: boolean;
  status: 'published' | 'draft' | 'reported';
}

export interface Comment {
  id: string;
  storiaId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  likes: number;
  parentId?: string; // Para respuestas a comentarios
  isAnonymous: boolean;
}

export interface ForumUser {
  id: string;
  name: string;
  email: string;
  joinedAt: Date;
  storiesCount: number;
  commentsCount: number;
  likesReceived: number;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  respondedAt?: Date;
}

export interface Friendship {
  id: string;
  userId1: string;
  userName1: string;
  userId2: string;
  userName2: string;
  createdAt: Date;
}

class ForumService {
  private readonly storiesKey = 'womxi_stories';
  private readonly commentsKey = 'womxi_comments';
  // Friendship keys removed
  private currentUser: ForumUser | null = null;

  constructor() {
    this.initializeUser();
    this.initializeMockData();
  }

  private initializeUser() {
    const userData = localStorage.getItem('w-protect-user');
    if (userData) {
      const user = JSON.parse(userData);
      this.currentUser = {
        id: user.email,
        name: user.name,
        email: user.email,
        joinedAt: new Date(user.registeredAt || Date.now()),
        storiesCount: 0,
        commentsCount: 0,
        likesReceived: 0
      };
    }
  }

  private initializeMockData() {
    // Solo agregar datos mock si no existen ya
    const existingStories = this.getStoredStories();
    if (existingStories.length === 0) {
      const mockStories: Storia[] = [
        {
          id: 'story-1',
          authorId: 'maria@womxi.com',
          authorName: 'María González',
          title: 'Mi historia de superación después de la violencia doméstica',
          content: 'Durante años viví en una relación tóxica, donde la violencia psicológica era parte del día a día. Pensé que nunca saldría de ahí, pero gracias al apoyo de mi hermana y organizaciones como esta, pude encontrar la fuerza para irme. Hoy, 3 años después, tengo mi propio negocio y mis hijos están seguros. Si estás pasando por algo similar, quiero que sepas que SÍ se puede salir. No estás sola. 💪❤️',
          category: 'violencia',
          tags: ['violencia-domestica', 'superacion', 'empoderamiento'],
          createdAt: new Date(Date.now() - 86400 * 1000 * 2), // 2 días atrás
          updatedAt: new Date(Date.now() - 86400 * 1000 * 2),
          likes: 45,
          commentsCount: 12,
          isAnonymous: false,
          status: 'published'
        },
        {
          id: 'story-2',
          authorId: 'ana@womxi.com',
          authorName: 'Ana (Anónima)',
          title: 'Cómo conseguí trabajo después de los 40',
          content: 'Después del divorcio, a los 42 años, me quedé sin trabajo y con dos hijos que mantener. Nadie me contrataba por la edad, pero no me rendí. Estudié marketing digital en línea, hice cursos gratuitos, practiqué muchísimo. Hoy trabajo desde casa para una empresa internacional y gano más que antes. La edad es solo un número cuando tienes determinación. 🌟',
          category: 'trabajo',
          tags: ['trabajo', 'edad', 'marketing-digital', 'independencia'],
          createdAt: new Date(Date.now() - 86400 * 1000 * 5), // 5 días atrás
          updatedAt: new Date(Date.now() - 86400 * 1000 * 5),
          likes: 32,
          commentsCount: 8,
          isAnonymous: true,
          status: 'published'
        },
        {
          id: 'story-3',
          authorId: 'sofia@womxi.com',
          authorName: 'Sofía Ramírez',
          title: 'Mi lucha contra la ansiedad y la depresión',
          content: 'Durante meses no podía salir de casa, la ansiedad me paralizaba. Pensé que nunca volvería a ser la misma. Pero poco a poco, con terapia, medicación y mucho apoyo familiar, fui saliendo del túnel. Hoy puedo decir que estoy mejor, que la vida vale la pena y que pedir ayuda no es de débiles, es de valientes. Si sientes que no puedes más, busca ayuda profesional. Tu vida importa. 🦋',
          category: 'salud',
          tags: ['salud-mental', 'ansiedad', 'depresion', 'terapia'],
          createdAt: new Date(Date.now() - 86400 * 1000 * 1), // 1 día atrás
          updatedAt: new Date(Date.now() - 86400 * 1000 * 1),
          likes: 67,
          commentsCount: 25,
          isAnonymous: false,
          status: 'published'
        }
      ];

      localStorage.setItem(this.storiesKey, JSON.stringify(mockStories));

      // Comentarios mock
      const mockComments: Comment[] = [
        {
          id: 'comment-1',
          storiaId: 'story-1',
          authorId: 'elena@womxi.com',
          authorName: 'Elena',
          content: 'Gracias por compartir tu historia María. Me diste la fuerza que necesitaba para tomar una decisión importante. No estamos solas. ❤️',
          createdAt: new Date(Date.now() - 86400 * 1000),
          likes: 12,
          isAnonymous: false
        },
        {
          id: 'comment-2',
          storiaId: 'story-1',
          authorId: 'carmen@womxi.com',
          authorName: 'Carmen',
          content: 'Qué valiente eres. Tu historia me recuerda que siempre hay esperanza. Gracias por inspirarnos 💪',
          createdAt: new Date(Date.now() - 86400 * 1000 * 0.5),
          likes: 8,
          isAnonymous: false
        },
        {
          id: 'comment-3',
          storiaId: 'story-3',
          authorId: 'lucia@womxi.com',
          authorName: 'Lucía',
          content: 'Yo también pasé por algo similar. Es increíble cómo compartes tu experiencia para ayudar a otras. Eres una guerrera 🦋',
          createdAt: new Date(Date.now() - 86400 * 1000 * 0.2),
          likes: 15,
          isAnonymous: false
        }
      ];

      localStorage.setItem(this.commentsKey, JSON.stringify(mockComments));
    }
  }

  // HISTORIAS
  async getStories(category?: string, limit?: number): Promise<Storia[]> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simular API
    
    let stories = this.getStoredStories();
    
    // Filtrar por categoría si se especifica
    if (category && category !== 'todas') {
      stories = stories.filter(story => story.category === category);
    }
    
    // Ordenar por fecha (más recientes primero)
    stories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Limitar resultados si se especifica
    if (limit) {
      stories = stories.slice(0, limit);
    }
    
    return stories;
  }

  async getStoryById(id: string): Promise<Storia | null> {
    const stories = this.getStoredStories();
    return stories.find(story => story.id === id) || null;
  }

  async createStory(storyData: Omit<Storia, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'commentsCount'>): Promise<Storia> {
    if (!this.currentUser) throw new Error('Usuario no autenticado');
    
    const newStory: Storia = {
      ...storyData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      commentsCount: 0
    };
    
    const stories = this.getStoredStories();
    stories.unshift(newStory); // Agregar al inicio
    this.saveStories(stories);
    
    return newStory;
  }

  async likeStory(storyId: string): Promise<void> {
    const stories = this.getStoredStories();
    const storyIndex = stories.findIndex(s => s.id === storyId);
    
    if (storyIndex !== -1) {
      stories[storyIndex].likes += 1;
      this.saveStories(stories);
    }
  }

  async searchStories(query: string): Promise<Storia[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const stories = this.getStoredStories();
    const searchTerm = query.toLowerCase();
    
    return stories.filter(story =>
      story.title.toLowerCase().includes(searchTerm) ||
      story.content.toLowerCase().includes(searchTerm) ||
      story.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // COMENTARIOS
  async getComments(storyId: string): Promise<Comment[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const comments = this.getStoredComments();
    return comments
      .filter(comment => comment.storiaId === storyId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async addComment(commentData: Omit<Comment, 'id' | 'createdAt' | 'likes'>): Promise<Comment> {
    if (!this.currentUser) throw new Error('Usuario no autenticado');
    
    const newComment: Comment = {
      ...commentData,
      id: this.generateId(),
      createdAt: new Date(),
      likes: 0
    };
    
    const comments = this.getStoredComments();
    comments.push(newComment);
    this.saveComments(comments);
    
    // Actualizar contador de comentarios en la historia
    await this.updateStoryCommentsCount(commentData.storiaId);
    
    return newComment;
  }

  async likeComment(commentId: string): Promise<void> {
    const comments = this.getStoredComments();
    const commentIndex = comments.findIndex(c => c.id === commentId);
    
    if (commentIndex !== -1) {
      comments[commentIndex].likes += 1;
      this.saveComments(comments);
    }
  }

  // MÉTODOS DE AMISTAD
    // Funciones de amistad removidas para simplificar el proyecto

  // UTILIDADES
  getCurrentUser(): ForumUser | null {
    return this.currentUser;
  }

  getCommentsCountSync(storyId: string): number {
    const comments = this.getStoredComments();
    return comments.filter(comment => comment.storiaId === storyId).length;
  }

  getCategories() {
    return [
      { id: 'todas', name: 'Todas las historias', icon: '📚' },
      { id: 'superacion', name: 'Superación Personal', icon: '💪' },
      { id: 'violencia', name: 'Violencia y Abuso', icon: '🛡️' },
      { id: 'trabajo', name: 'Trabajo y Carrera', icon: '💼' },
      { id: 'familia', name: 'Familia e Hijos', icon: '👨‍👩‍👧‍👦' },
      { id: 'salud', name: 'Salud Mental', icon: '🧠' },
      { id: 'educacion', name: 'Educación', icon: '🎓' },
      { id: 'otro', name: 'Otros Temas', icon: '✨' }
    ];
  }

  // MÉTODOS PRIVADOS
  private async updateStoryCommentsCount(storyId: string): Promise<void> {
    const stories = this.getStoredStories();
    const storyIndex = stories.findIndex(s => s.id === storyId);
    
    if (storyIndex !== -1) {
      const comments = this.getStoredComments();
      const commentCount = comments.filter(c => c.storiaId === storyId).length;
      stories[storyIndex].commentsCount = commentCount;
      this.saveStories(stories);
    }
  }

  private getStoredStories(): Storia[] {
    try {
      const stored = localStorage.getItem(this.storiesKey);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((story: any) => ({
        ...story,
        createdAt: new Date(story.createdAt),
        updatedAt: new Date(story.updatedAt)
      }));
    } catch {
      return [];
    }
  }

  private saveStories(stories: Storia[]): void {
    localStorage.setItem(this.storiesKey, JSON.stringify(stories));
  }

  private getStoredComments(): Comment[] {
    try {
      const stored = localStorage.getItem(this.commentsKey);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((comment: any) => ({
        ...comment,
        createdAt: new Date(comment.createdAt)
      }));
    } catch {
      return [];
    }
  }

  private saveComments(comments: Comment[]): void {
    localStorage.setItem(this.commentsKey, JSON.stringify(comments));
  }



  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const forumService = new ForumService();