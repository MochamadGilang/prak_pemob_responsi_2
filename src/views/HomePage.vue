<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title class="page-title">Resep REMY</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="blue-theme">
      <div class="header-decor">
        <h2 class="welcome-text">Selamat Datang Di Dapur REMY 🍳</h2>
      </div>

      <ion-refresher slot="fixed" :pull-factor="0.5" :pull-min="100" :pull-max="200" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="scrollable-container">
        <ion-list>
          <ion-item-sliding v-for="resep in activeTodos" :key="resep.id" :ref="(el) => setItemRef(el, resep.id)">
            <ion-item>
              <ion-card class="recipe-card">
                <ion-card-header>
                  <ion-card-title class="ion-text-wrap limited-text">🍲 {{ resep.title }}</ion-card-title>
                  <ion-card-subtitle class="limited-text">📝 {{ resep.description }}</ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                  <ion-badge color="tertiary">{{ getRelativeTime(resep.updatedAt) }}</ion-badge>
                </ion-card-content>
              </ion-card>
            </ion-item>
            <ion-item-options side="end">
              <ion-item-option color="success" expandable @click="handleEdit(resep)">
                <ion-icon slot="icon-only" :icon="create" size="large"></ion-icon>
              </ion-item-option>
              <ion-item-option color="danger" expandable @click="handleDelete(resep)">
                <ion-icon slot="icon-only" :icon="trash" size="large"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button color="primary" @click="isOpen = true">
          <ion-icon :icon="add" size="large"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <InputModal v-model:isOpen="isOpen" v-model:editingId="editingId" :todo="todo" @submit="handleSubmit" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonIcon,
  IonFab,
  IonFabButton,
  loadingController,
  IonRefresher,
  IonRefresherContent,
  toastController
} from '@ionic/vue';
import { add, create, trash } from 'ionicons/icons';
import InputModal from '@/components/InputModal.vue';
import { onMounted, ref, computed, onUnmounted } from 'vue';
import { firestoreService, type Todo } from '@/utils/firestore';
import { formatDistanceToNow } from 'date-fns';

const isOpen = ref(false);
const editingId = ref<string | null>(null);
const todos = ref<Todo[]>([]);
const todo = ref<Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'status'>>({
  title: '',
  description: '',
});
const activeTodos = computed(() => todos.value.filter(todo => !todo.status));
const itemRefs = ref<Map<string, HTMLIonItemSlidingElement>>(new Map());
let intervalId: any;

const setItemRef = (el: any, id: string) => {
  if (el) itemRefs.value.set(id, el.$el);
};

const showToast = async (message: string, color = 'success') => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color,
    position: 'top',
  });
  await toast.present();
};

const getRelativeTime = (date: any) => {
  try {
    const jsDate = date?.toDate ? date.toDate() : new Date(date);
    return formatDistanceToNow(jsDate, { addSuffix: true });
  } catch {
    return 'Invalid date';
  }
};

const handleRefresh = async (event: any) => {
  try {
    await loadTodos();
  } catch (error) {
    console.error('Error refreshing:', error);
  } finally {
    event.target.complete();
  }
};

const handleSubmit = async (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
  if (!todo.title) {
    await showToast('Title is required', 'warning');
    return;
  }
  try {
    if (editingId.value) {
      await firestoreService.updateTodo(editingId.value, todo as Todo);
      await showToast('Resep berhasil diperbarui');
    } else {
      await firestoreService.addTodo(todo as Todo);
      await showToast('Resep berhasil ditambahkan');
    }
    loadTodos();
  } catch (error) {
    await showToast('Terjadi kesalahan', 'danger');
    console.error(error);
  } finally {
    editingId.value = null;
  }
};

const loadTodos = async () => {
  const loading = await loadingController.create({ message: 'Memuat...' });
  await loading.present();
  try {
    todos.value = await firestoreService.getTodos();
  } catch (error) {
    console.error(error);
  } finally {
    await loading.dismiss();
  }
};

onMounted(() => {
  loadTodos();
  intervalId = setInterval(() => {}, 60000);
});

onUnmounted(() => clearInterval(intervalId));

const handleEdit = async (resep: Todo) => {
  const slidingItem = itemRefs.value.get(resep.id!);
  await slidingItem?.close();
  editingId.value = resep.id!;
  todo.value = { title: resep.title, description: resep.description };
  isOpen.value = true;
};

const handleDelete = async (resep: Todo) => {
  try {
    await firestoreService.deleteTodo(resep.id!);
    await showToast('Resep berhasil dihapus');
    loadTodos();
  } catch (error) {
    await showToast('Gagal menghapus resep', 'danger');
    console.error(error);
  }
};
</script>

<style scoped>
.blue-theme {
  --background: #e3f2fd; /* Ganti background menjadi biru muda */
  --ion-color-primary: #1976d2; /* Ganti warna primary menjadi biru */
  --ion-color-secondary: #64b5f6; /* Ganti warna sekunder menjadi biru terang */
  --ion-color-tertiary: #1565c0; /* Ganti warna tersier menjadi biru gelap */
}

.header-decor {
  text-align: center;
  padding: 20px 0;
  background: linear-gradient(to right, #64b5f6, #1976d2); /* Ganti gradien menjadi biru */
  color: white;
  font-size: 1.2rem;
}

.welcome-text {
  margin: 0;
  font-weight: bold;
}

.scrollable-container {
  padding: 10px;
  max-height: 70vh;
  overflow-y: auto;
}

.recipe-card {
  background: #bbdefb; /* Ganti latar belakang kartu menjadi biru muda */
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

ion-card-title {
  color: #1976d2; /* Ganti warna judul menjadi biru */
}

.limited-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

ion-fab-button {
  --background: #1976d2; /* Ganti warna tombol floating action menjadi biru */
}

ion-badge {
  --background: #1565c0; /* Ganti warna badge menjadi biru gelap */
  --color: white;
}
</style>
