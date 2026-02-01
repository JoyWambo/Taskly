import React, { useState, useMemo } from 'react';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '@/lib/slices/categorySlice';
import { useSnackbar } from 'notistack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Loader2,
  Folder,
  Palette,
  Table as TableIcon,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const Category = () => {
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'
  const [expandedRows, setExpandedRows] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3498db',
    icon: 'folder',
    isActive: true,
    isDefault: false,
  });
  const { enqueueSnackbar } = useSnackbar();

  const { data: categoriesData, isLoading } = useGetCategoriesQuery();
  const categories = useMemo(() => {
    const cats = categoriesData?.categories;
    if (!Array.isArray(cats)) {
      console.warn('Categories data is not an array:', cats);
      return [];
    }
    return cats;
  }, [categoriesData]);

  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase();
    return categories.filter(
      (category) =>
        category.name?.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory({
          categoryId: editingCategory._id,
          ...formData,
        }).unwrap();
        enqueueSnackbar('Category updated', { variant: 'success' });
      } else {
        await createCategory(formData).unwrap();
        enqueueSnackbar('Category created', { variant: 'success' });
      }
      setShowCategoryForm(false);
      setEditingCategory(null);
      resetForm();
    } catch (error) {
      const message =
        error?.data?.message || error.message || 'Failed to save category.';
      console.error('Failed to save category:', message);
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
      icon: category.icon,
      isActive: category.isActive,
      isDefault: category.isDefault,
    });
    setShowCategoryForm(true);
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(deleteCategoryId).unwrap();
      enqueueSnackbar('Category deleted', { variant: 'success' });
      setDeleteCategoryId(null);
    } catch (error) {
      const message =
        error?.data?.message || error.message || 'Failed to delete category.';
      console.error('Failed to delete category:', message);
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3498db',
      icon: 'folder',
      isActive: true,
      isDefault: false,
    });
  };

  const openCreateForm = () => {
    setEditingCategory(null);
    resetForm();
    setShowCategoryForm(true);
  };

  const toggleRowExpansion = (categoryId) => {
    setExpandedRows((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Categories</h1>
          <p className='text-muted-foreground'>Manage your task categories</p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className='h-4 w-4 mr-2' />
          New Category
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Categories
            </CardTitle>
            <Folder className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Active Categories
            </CardTitle>
            <Palette className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {categories.filter((c) => c.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Default Categories
            </CardTitle>
            <Folder className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {categories.filter((c) => c.isDefault).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and View Toggle */}
      <div className='flex items-center justify-between'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search categories...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-8'
          />
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setViewMode('table')}
          >
            <TableIcon className='h-4 w-4 mr-2' />
            Table
          </Button>
          <Button
            variant={viewMode === 'card' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setViewMode('card')}
          >
            <LayoutGrid className='h-4 w-4 mr-2' />
            Cards
          </Button>
        </div>
      </div>

      {/* Categories Display */}
      {viewMode === 'table' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-10'></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories
                .filter((category) => category && category._id)
                .map((category) => (
                  <React.Fragment key={category._id}>
                    <TableRow>
                      <TableCell>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => toggleRowExpansion(category._id)}
                        >
                          {expandedRows.includes(category._id) ? (
                            <ChevronDown className='h-4 w-4' />
                          ) : (
                            <ChevronRight className='h-4 w-4' />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className='font-medium'>
                        {category.name || 'Unnamed'}
                      </TableCell>
                      <TableCell className='max-w-xs truncate'>
                        {typeof category.description === 'string'
                          ? category.description
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center space-x-2'>
                          <div
                            className='w-6 h-6 rounded-full border'
                            style={{
                              backgroundColor:
                                typeof category.color === 'string'
                                  ? category.color
                                  : '#3498db',
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {typeof category.taskCount === 'number'
                          ? category.taskCount
                          : 0}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={category.isActive ? 'default' : 'secondary'}
                        >
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {category.isDefault && (
                          <Badge variant='outline' className='ml-2'>
                            Default
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem
                              onClick={() => handleEdit(category)}
                            >
                              <Edit className='h-4 w-4 mr-2' />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteCategoryId(category._id)}
                              className='text-destructive'
                            >
                              <Trash2 className='h-4 w-4 mr-2' />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {expandedRows.includes(category._id) && (
                      <TableRow>
                        <TableCell colSpan={7} className='bg-muted/50'>
                          <div className='p-4'>
                            <h4 className='font-medium mb-2'>
                              Additional Details
                            </h4>
                            <div className='grid grid-cols-2 gap-4 text-sm'>
                              <div>
                                <span className='font-medium'>Icon:</span>{' '}
                                {typeof category.icon === 'string'
                                  ? category.icon
                                  : 'N/A'}
                              </div>
                              <div>
                                <span className='font-medium'>Sort Order:</span>{' '}
                                {typeof category.sortOrder === 'number'
                                  ? category.sortOrder
                                  : 'N/A'}
                              </div>
                              <div>
                                <span className='font-medium'>Created:</span>{' '}
                                {category.createdAt
                                  ? new Date(
                                      category.createdAt
                                    ).toLocaleDateString()
                                  : 'N/A'}
                              </div>
                              <div>
                                <span className='font-medium'>Updated:</span>{' '}
                                {category.updatedAt
                                  ? new Date(
                                      category.updatedAt
                                    ).toLocaleDateString()
                                  : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
            </TableBody>
          </Table>
          {filteredCategories.length === 0 && (
            <div className='text-center py-8 text-muted-foreground'>
              {searchQuery
                ? 'No categories found matching your search.'
                : 'No categories yet. Create your first category!'}
            </div>
          )}
        </Card>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredCategories
            .filter((category) => category && category._id)
            .map((category) => (
              <Card
                key={category._id}
                className='hover:shadow-lg transition-shadow'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className='w-8 h-8 rounded-full border-2 flex items-center justify-center'
                        style={{
                          backgroundColor:
                            typeof category.color === 'string'
                              ? category.color
                              : '#3498db',
                        }}
                      >
                        <Folder className='h-4 w-4 text-white' />
                      </div>
                      <div>
                        <CardTitle className='text-lg'>
                          {category.name || 'Unnamed'}
                        </CardTitle>
                        <div className='flex items-center space-x-2 mt-1'>
                          <Badge
                            variant={
                              category.isActive ? 'default' : 'secondary'
                            }
                            className='text-xs'
                          >
                            {category.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {category.isDefault && (
                            <Badge variant='outline' className='text-xs'>
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => handleEdit(category)}>
                          <Edit className='h-4 w-4 mr-2' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteCategoryId(category._id)}
                          className='text-destructive'
                        >
                          <Trash2 className='h-4 w-4 mr-2' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-muted-foreground mb-3'>
                    {typeof category.description === 'string'
                      ? category.description
                      : 'No description provided.'}
                  </p>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>
                      {typeof category.taskCount === 'number'
                        ? category.taskCount
                        : 0}{' '}
                      tasks
                    </span>
                    <span className='text-muted-foreground'>
                      Color:{' '}
                      {typeof category.color === 'string'
                        ? category.color
                        : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          {filteredCategories.length === 0 && (
            <div className='col-span-full text-center py-8 text-muted-foreground'>
              {searchQuery
                ? 'No categories found matching your search.'
                : 'No categories yet. Create your first category!'}
            </div>
          )}
        </div>
      )}

      {/* Category Form Dialog */}
      <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Update the category details below.'
                : 'Add a new category to organize your tasks.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='name' className='text-right'>
                  Name
                </Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className='col-span-3'
                  required
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='description' className='text-right'>
                  Description
                </Label>
                <Textarea
                  id='description'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className='col-span-3'
                  rows={3}
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='color' className='text-right'>
                  Color
                </Label>
                <div className='col-span-3 flex items-center space-x-2'>
                  <Input
                    id='color'
                    type='color'
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className='w-12 h-8 p-1'
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    placeholder='#3498db'
                  />
                </div>
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='icon' className='text-right'>
                  Icon
                </Label>
                <Input
                  id='icon'
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  className='col-span-3'
                  placeholder='folder'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label className='text-right'>Settings</Label>
                <div className='col-span-3 space-y-2'>
                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='isActive'
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isActive: checked })
                      }
                    />
                    <Label htmlFor='isActive'>Active</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='isDefault'
                      checked={formData.isDefault}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isDefault: checked })
                      }
                    />
                    <Label htmlFor='isDefault'>Default Category</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type='submit'>
                {editingCategory ? 'Update' : 'Create'} Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteCategoryId}
        onOpenChange={() => setDeleteCategoryId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot
              be undone. Tasks associated with this category will remain but may
              lose their category reference.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Category;
