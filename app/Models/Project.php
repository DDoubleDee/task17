<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Project extends Model
{
    protected $table = 'projects';
    use HasFactory;
    protected $fillable = ['name', 'content', 'creator_id'];
    public $timestamps = false;
}
