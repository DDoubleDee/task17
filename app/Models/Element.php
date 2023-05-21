<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Element extends Model
{
    protected $table = 'elements';
    use HasFactory;
    protected $fillable = ['name', 'width', 'height', 'is_basis', 'svg'];
    public $timestamps = false;
}
